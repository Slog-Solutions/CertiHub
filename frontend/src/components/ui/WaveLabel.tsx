"use client";

/**
 * WaveLabel – letter-by-letter wave hover animation.
 *
 * Technique (from wave-hover-labels.html reference):
 *   Two identical rows of letter <span>s are stacked vertically inside a
 *   clipped container.  At rest the top row is visible.  On hover the whole
 *   stack shifts up by one line-height so the bottom row slides into view,
 *   creating a seamless "wave swap".  Each letter has a staggered
 *   transition-delay so they move one-after-another left-to-right.
 *
 * Usage:
 *   <WaveLabel text="Home" />
 *   <WaveLabel text="Services" className="text-sm font-bold" />
 *
 * Props:
 *   text      – the string to animate (spaces are preserved as &nbsp;)
 *   className – extra classes forwarded to the outer <span> (for colour etc.)
 *   stagger   – ms delay per letter (default 35)
 *   duration  – transition duration in ms (default 350)
 *   easing    – CSS easing string (default cubic-bezier(.65,0,.35,1))
 */

interface WaveLabelProps {
  text: string;
  className?: string;
  stagger?: number;  // ms delay per letter
  duration?: number; // ms per-letter transition
  easing?: string;
}

export default function WaveLabel({
  text,
  className = "",
  stagger = 22,
  duration = 220,
  easing = "cubic-bezier(.65,0,.35,1)",
}: WaveLabelProps) {
  const chars = [...text]; // Unicode-safe split
  const lineHeight = "1.2em";

  /** Build one row of per-letter spans */
  const Row = ({ row }: { row: number }) => (
    <span
      style={{ display: "inline-block" }}
      aria-hidden={row === 1 ? true : undefined}
    >
      {chars.map((ch, i) => (
        <span
          key={`${row}-${i}`}
          className="wl-letter"
          style={
            {
              display: "inline-block",
              "--delay": `${i * stagger}ms`,
              "--duration": `${duration}ms`,
              "--easing": easing,
            } as React.CSSProperties
          }
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );

  return (
    <>
      {/* Inline style block — scoped so it won't conflict with anything else */}
      <style>{`
        .wl-clip {
          display: inline-flex;
          overflow: hidden;
          height: ${lineHeight};
          line-height: ${lineHeight};
          vertical-align: bottom;
        }
        .wl-stack {
          display: inline-flex;
          flex-direction: column;
          transform: translateY(0);
        }
        /* Each letter slides individually via --delay */
        .wl-letter {
          transition:
            transform var(--duration) var(--easing) var(--delay);
          transform: translateY(0);
        }
        /* On hover the whole stack moves up one line-height */
        .wl-trigger:hover .wl-stack {
          /* no-op – we animate individual letters instead */
        }
        .wl-trigger:hover .wl-letter {
          transform: translateY(-${lineHeight});
        }
      `}</style>

      {/*
        .wl-trigger is placed on the parent element via the className prop;
        however the hover trigger is actually the closest ancestor that has
        pointer events — which is the nav link / button that wraps this component.
        We therefore set it on the clip container itself and rely on CSS
        :hover propagation from the ancestor.  To make that work we use
        the :has selector polyfill-free approach: mark the clip with a
        data attribute and let the parent drive it via group-hover or just
        let the built-in CSS :hover bubble work.

        Simplest approach: wrap in a <span> that catches its own hover.
        This works because the <span> fills the inline width of the text.
      */}
      <span
        className={`wl-clip wl-trigger ${className}`}
        role="presentation"
      >
        <span className="wl-stack">
          <Row row={0} />
          <Row row={1} />
        </span>
      </span>
    </>
  );
}
