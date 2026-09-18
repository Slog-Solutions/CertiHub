"use client";

/**
 * SlogIntro — one-time canvas particle intro animation.
 *
 * Ported faithfully from /src/assets/slog-intro-particles (1).html.
 *
 * Key changes vs the vanilla prototype:
 *  - Canvas / DOM refs replace getElementById / querySelector
 *  - document.querySelector('[data-slog-logo]') locates the real logo
 *  - next/font guarantees Poppins is loaded → no document.fonts.load() race
 *  - sessionStorage gate so it only plays once per browser session
 *  - prefers-reduced-motion check skips immediately
 *  - Generation counter (introGenRef) makes stale rAF/setTimeout frames bail
 *  - All cleanup (rAF, setTimeout, resize listener) happens in useEffect cleanup
 */

import { useEffect, useRef } from "react";

const WORD = "SLOG";
const FONT_WEIGHT = 800;
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const SESSION_KEY = "slog-intro-played";

const BLUE_SHADES = [
  "#1B3B7A",
  "#2A54A8",
  "#3E6FD9",
  "#6C97E8",
  "#9EC0F2",
  "#FFFFFF",
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}

interface Layout {
  x: number;
  y: number;
  fontPx: number;
  width: number;
  ascent: number;
  descent: number;
}

interface Particle {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  delay: number;
  dur: number;
  size: number;
  color: string;
}

export default function SlogIntro() {
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // generation counter — bumped on every (re)start so stale rAF callbacks bail
  const introGenRef = useRef(0);
  const introActiveRef = useRef(false);
  // track all pending rAF ids and timeouts so we can cancel on unmount
  const rafRef = useRef<number | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // ── SSR guard (shouldn't be needed with 'use client' but be safe)
    if (typeof window === "undefined") return;

    // ── Reduced-motion: skip immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hideBg();
      return;
    }

    // ── Session gate: skip on internal navigation
    if (sessionStorage.getItem(SESSION_KEY)) {
      hideBg();
      return;
    }

    const bg = bgRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0,
      vh = 0;

    function hideBgImmediate() {
      bg.style.display = "none";
      canvas.style.display = "none";
    }

    function hideBg() {
      if (bgRef.current) bgRef.current.style.display = "none";
      if (canvasRef.current) canvasRef.current.style.display = "none";
    }

    function scheduleTimeout(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      timeoutsRef.current.push(id);
      return id;
    }

    function scheduleRaf(fn: FrameRequestCallback) {
      const id = requestAnimationFrame(fn);
      rafRef.current = id;
      return id;
    }

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeLayout(): Layout {
      let fontPx = Math.min(vw * 0.16, vh * 0.34, 220);
      ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
      let m = ctx.measureText(WORD);
      const targetWidth = vw * 0.7;
      if (m.width > 0) fontPx = fontPx * (targetWidth / m.width);

      for (let guard = 0; guard < 6; guard++) {
        ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
        m = ctx.measureText(WORD);
        if (m.width <= vw * 0.84) break;
        fontPx = fontPx * ((vw * 0.78) / m.width);
      }
      fontPx = Math.min(fontPx, vh * 0.34);
      ctx.font = `${FONT_WEIGHT} ${fontPx}px ${FONT_FAMILY}`;
      m = ctx.measureText(WORD);

      const ascent = m.actualBoundingBoxAscent || fontPx * 0.72;
      const descent = m.actualBoundingBoxDescent || fontPx * 0.14;
      const textW = m.width;
      const textH = ascent + descent;

      const x = vw / 2 - textW / 2;
      const y = vh / 2 + (textH / 2 - descent);

      return { x, y, fontPx, width: textW, ascent, descent };
    }

    function samplePointsForLayout(layout: Layout): { x: number; y: number }[] {
      const off = document.createElement("canvas");
      off.width = vw;
      off.height = vh;
      const octx = off.getContext("2d")!;
      octx.font = `${FONT_WEIGHT} ${layout.fontPx}px ${FONT_FAMILY}`;
      octx.textAlign = "left";
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "#000";
      octx.fillText(WORD, layout.x, layout.y);

      const step = Math.max(2, Math.round(layout.fontPx / 34));
      const img = octx.getImageData(0, 0, vw, vh).data;
      const pts: { x: number; y: number }[] = [];
      const top = Math.max(0, Math.floor(layout.y - layout.ascent - 4));
      const bottom = Math.min(vh, Math.ceil(layout.y + layout.descent + 4));
      const left = Math.max(0, Math.floor(layout.x - 4));
      const right = Math.min(vw, Math.ceil(layout.x + layout.width + 4));

      for (let py = top; py < bottom; py += step) {
        for (let px = left; px < right; px += step) {
          const idx = (py * vw + px) * 4 + 3;
          if (img[idx] > 120) {
            pts.push({
              x: px + (Math.random() - 0.5) * step,
              y: py + (Math.random() - 0.5) * step,
            });
          }
        }
      }
      return pts;
    }

    function buildParticles(targets: { x: number; y: number }[]): Particle[] {
      return targets.map((t) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(vw, vh) * (0.55 + Math.random() * 0.5);
        return {
          sx: vw / 2 + Math.cos(angle) * dist,
          sy: vh / 2 + Math.sin(angle) * dist,
          tx: t.x,
          ty: t.y,
          x: 0,
          y: 0,
          delay: Math.random() * 230,
          dur: 550 + Math.random() * 150,
          size: 1.4 + Math.random() * 1.8,
          color: BLUE_SHADES[Math.floor(Math.random() * BLUE_SHADES.length)],
        };
      });
    }

    function runIntro(layout: Layout, points: { x: number; y: number }[], myGen: number) {
      const particles = buildParticles(points);
      let startTime: number | null = null;

      const stale = () => myGen !== introGenRef.current;

      function drawSolidWord(alpha: number, glow: number) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${FONT_WEIGHT} ${layout.fontPx}px ${FONT_FAMILY}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.shadowColor = "rgba(110,150,235,0.9)";
        ctx.shadowBlur = glow || 0;
        ctx.fillStyle = "#2A54A8";
        ctx.fillText(WORD, layout.x, layout.y);
        ctx.restore();
      }

      // ── Phase 1: particle assembly
      function assembleFrame(now: number) {
        if (stale()) return;
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, vw, vh);
        let allDone = true;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const t = elapsed - p.delay;
          if (t < 0) { allDone = false; continue; }
          const tt = Math.min(t / p.dur, 1);
          if (tt < 1) allDone = false;
          const eased = easeOutCubic(tt);
          p.x = p.sx + (p.tx - p.sx) * eased;
          p.y = p.sy + (p.ty - p.sy) * eased;
          const alpha = Math.min(1, tt * 1.6);
          const r = p.size * (0.35 + 0.65 * eased);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!allDone) {
          scheduleRaf(assembleFrame);
        } else {
          scheduleRaf(solidifyWord);
        }
      }

      // ── Phase 2: crossfade dots → solid glyph
      function solidifyWord() {
        if (stale()) return;
        let morphStart: number | null = null;
        const morphDur = 210;

        function morphFrame(now: number) {
          if (stale()) return;
          if (!morphStart) morphStart = now;
          const t = Math.min((now - morphStart) / morphDur, 1);
          const eased = easeOutCubic(t);
          ctx.clearRect(0, 0, vw, vh);

          ctx.globalAlpha = 1 - eased;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          drawSolidWord(eased, 10);

          if (t < 1) {
            scheduleRaf(morphFrame);
          } else {
            scheduleTimeout(glowPulse, 50);
          }
        }
        scheduleRaf(morphFrame);
      }

      // ── Phase 3: glow pulses
      function glowPulse() {
        if (stale()) return;
        let pulses = 0;
        function pulseFrame() {
          if (stale()) return;
          pulses++;
          ctx.clearRect(0, 0, vw, vh);
          const glow = pulses % 2 === 0 ? 24 : 10;
          drawSolidWord(1, glow);
          if (pulses < 2) {
            scheduleTimeout(pulseFrame, 390);
          } else {
            scheduleTimeout(flyToNav, 250);
          }
        }
        pulseFrame();
      }

      // ── Phase 4: fly to real logo position
      function flyToNav() {
        if (stale()) return;

        // Locate the real header logo
        const navLogo = document.querySelector<HTMLElement>("[data-slog-logo]");
        const navRect = navLogo
          ? navLogo.getBoundingClientRect()
          : { left: 24, top: 16, width: 80, height: 45 };
        const navFontPx = navLogo
          ? parseFloat(window.getComputedStyle(navLogo).fontSize) || 24
          : 24;
        const scaleEnd = navFontPx / layout.fontPx;

        const cx0 = layout.x + layout.width / 2;
        const cy0 = layout.y - (layout.ascent - layout.descent) / 2;
        const tx = navRect.left + navRect.width / 2;
        const ty = navRect.top + navRect.height / 2;

        let flyStart: number | null = null;
        const flyDur = 450;

        function flyFrame(now: number) {
          if (stale()) return;
          if (!flyStart) flyStart = now;
          const t = Math.min((now - flyStart) / flyDur, 1);
          const eased = easeInCubic(t);
          const cx = cx0 + (tx - cx0) * eased;
          const cy = cy0 + (ty - cy0) * eased;
          const scale = 1 + (scaleEnd - 1) * eased;

          ctx.clearRect(0, 0, vw, vh);
          ctx.save();
          // fade only in the last 15% so it dissolves exactly as it lands
          ctx.globalAlpha = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);
          ctx.translate(-cx0, -cy0);
          ctx.font = `${FONT_WEIGHT} ${layout.fontPx}px ${FONT_FAMILY}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.shadowColor = "rgba(110,150,235,0.85)";
          ctx.shadowBlur = 8 * (1 - eased);
          ctx.fillStyle = "#2A54A8";
          ctx.fillText(WORD, layout.x, layout.y);
          ctx.restore();

          if (t < 1) {
            scheduleRaf(flyFrame);
          } else {
            // pop effect on the real logo
            if (navLogo) {
              navLogo.classList.add("slog-intro-pop");
              scheduleTimeout(() => navLogo.classList.remove("slog-intro-pop"), 400);
            }
            // fade overlay out
            bg.style.opacity = "0";
            canvas.style.opacity = "0";
            introActiveRef.current = false;
            sessionStorage.setItem(SESSION_KEY, "1");
            scheduleTimeout(() => {
              if (stale()) return;
              hideBgImmediate();
            }, 450);
          }
        }
        scheduleRaf(flyFrame);
      }

      scheduleRaf(assembleFrame);
    }

    // ── Main entry: (re)start the whole sequence
    function playIntro() {
      introGenRef.current++;
      const myGen = introGenRef.current;
      introActiveRef.current = true;
      bg.style.display = "";
      bg.style.opacity = "1";
      canvas.style.display = "";
      canvas.style.opacity = "1";

      // next/font guarantees Poppins is loaded before mount — run immediately
      if (myGen !== introGenRef.current) return;
      resize();
      const layout = computeLayout();
      const points = samplePointsForLayout(layout);
      runIntro(layout, points, myGen);
    }

    // ── Resize guard: restart cleanly if resized while overlay is visible
    function onResize() {
      if (!introActiveRef.current) return;
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (introActiveRef.current) {
          // cancel any in-flight rAF
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          playIntro();
        }
      }, 150);
    }
    window.addEventListener("resize", onResize);

    // ── Wait for stable viewport size then kick off
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let stableChecks = 0;
    const waitStart = Date.now();

    function waitForStableSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && h === lastH) {
        stableChecks++;
      } else {
        stableChecks = 0;
        lastW = w;
        lastH = h;
      }
      if (stableChecks >= 2 || Date.now() - waitStart > 1500) {
        playIntro();
      } else {
        scheduleTimeout(waitForStableSize, 120);
      }
    }
    scheduleTimeout(waitForStableSize, 150);

    // ── Cleanup on unmount
    return () => {
      introGenRef.current++; // stale all in-flight frames
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Pop animation for the real logo when the intro lands */}
      <style>{`
        [data-slog-logo].slog-intro-pop {
          transform: scale(1.18) !important;
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1) !important;
        }
        [data-slog-logo] {
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
        }
      `}</style>

      {/* Overlay background — radial gradient matching prototype */}
      <div
        ref={bgRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background:
            "radial-gradient(120% 120% at 50% 40%, #ffffff 0%, #eef3fc 55%, #dfe9f9 100%)",
          transition: "opacity 0.9s ease",
          pointerEvents: "none",
        }}
      />

      {/* Canvas — particle animation lives here */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          transition: "opacity 0.5s ease",
        }}
      />
    </>
  );
}
