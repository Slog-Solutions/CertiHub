const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PNG } = require('pngjs');

const signaturesDir = path.join(__dirname, '../uploads/signatures');
const certsDir = path.join(__dirname, '../uploads/certificates');

/**
 * Returns the latest modification timestamp (in ms) of the director signature assets.
 */
function getLatestSignatureMtime() {
  const leftPath = path.join(signaturesDir, 'left_signature.png');
  const rightPath = path.join(signaturesDir, 'right_signature.png');
  let maxTime = 0;
  if (fs.existsSync(leftPath)) {
    maxTime = Math.max(maxTime, fs.statSync(leftPath).mtimeMs);
  }
  if (fs.existsSync(rightPath)) {
    maxTime = Math.max(maxTime, fs.statSync(rightPath).mtimeMs);
  }
  return maxTime;
}

/**
 * Cleans a PNG buffer directly in memory, removing paper & phone shadows,
 * isolating textual pen ink strokes, and auto-cropping to content bounds.
 */
function cleanPngBuffer(inputBuf) {
  try {
    const png = PNG.sync.read(inputBuf);
    const width = png.width;
    const height = png.height;

    // Check if the image ALREADY has transparent background
    let transparentPixels = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] < 20) {
        transparentPixels++;
      }
    }
    const isAlreadyTransparent = transparentPixels > (width * height * 0.05);

    // 1. Find the darkest luminance among opaque ink pixels
    let minLum = 255;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] > 80) {
        const lum = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
        if (lum < minLum) minLum = lum;
      }
    }

    // 2. Ink threshold: strictly capped at 80 to eliminate shadows (which are >= 90)
    const inkCutoff = Math.max(35, Math.min(80, minLum + 45));
    const edgeBand = 15;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let inkCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const a = png.data[idx + 3];

        // CRITICAL: NEVER turn a transparent pixel into opaque!
        if (a < 20) {
          png.data[idx + 3] = 0;
          continue;
        }

        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // If the image is ALREADY transparent, preserve the clean transparent signature
        if (isAlreadyTransparent) {
          png.data[idx] = Math.min(r, 40);
          png.data[idx + 1] = Math.min(g, 40);
          png.data[idx + 2] = Math.min(b, 55);

          if (a > 40) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            inkCount++;
          }
          continue;
        }

        // For non-transparent images (photos of paper):
        if (lum >= inkCutoff) {
          // Transparent paper and shadow
          png.data[idx + 3] = 0;
        } else {
          // Anti-aliased transition on stroke edge
          let alpha = 255;
          if (lum > inkCutoff - edgeBand) {
            const factor = (inkCutoff - lum) / edgeBand;
            alpha = Math.round(255 * Math.max(0, Math.min(1, factor)));
          }
          png.data[idx + 3] = alpha;

          // Crisp authentic pen ink color (deep blue-black)
          png.data[idx] = Math.min(r, 40);
          png.data[idx + 1] = Math.min(g, 40);
          png.data[idx + 2] = Math.min(b, 55);

          if (alpha > 40) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            inkCount++;
          }
        }
      }
    }

    // Auto-crop to content with 24px padding
    if (inkCount > 40 && maxX > minX && maxY > minY) {
      const pad = 24;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(width - cropX, (maxX - minX) + (pad * 2));
      const cropH = Math.min(height - cropY, (maxY - minY) + (pad * 2));

      const outPng = new PNG({ width: cropW, height: cropH });
      PNG.bitblt(png, outPng, cropX, cropY, cropW, cropH, 0, 0);
      return PNG.sync.write(outPng);
    }

    return PNG.sync.write(png);
  } catch (err) {
    console.error('PNG buffer clean failed, returning original:', err.message);
    return inputBuf;
  }
}

/**
 * Strips paper background, extracts textual ink strokes, and saves as transparent PNG.
 *
 * @param {string} inputPath
 * @param {string} outputPath
 */
function cleanSignatureImage(inputPath, outputPath) {
  try {
    const rawBuf = fs.readFileSync(inputPath);
    // If it's already a PNG, process directly in pure JS
    if (rawBuf[0] === 0x89 && rawBuf[1] === 0x50 && rawBuf[2] === 0x4e && rawBuf[3] === 0x47) {
      const cleaned = cleanPngBuffer(rawBuf);
      fs.writeFileSync(outputPath, cleaned);
      return true;
    }

    // Otherwise, use PowerShell for format conversion & cleaning on Windows
    const psScript = path.join(__dirname, 'cleanSignature.ps1');
    if (fs.existsSync(psScript) && process.platform === 'win32') {
      execSync(`powershell -ExecutionPolicy Bypass -File "${psScript}" -InputPath "${inputPath}" -OutputPath "${outputPath}"`, {
        stdio: 'pipe',
        timeout: 20000
      });
      return true;
    }
  } catch (err) {
    console.error('Signature background cleaning error:', err.message);
  }
  return false;
}

/**
 * Clears stale signed certificate PDFs so they automatically regenerate with latest signatures.
 */
function invalidateStaleSignedCertificates() {
  try {
    if (!fs.existsSync(certsDir)) return;
    const latestSigTime = getLatestSignatureMtime();
    const files = fs.readdirSync(certsDir);
    let invalidatedCount = 0;

    for (const file of files) {
      // Never delete unsigned certificates
      if (file.endsWith('_unsigned.pdf')) continue;
      if (!file.endsWith('.pdf')) continue;

      const fullPath = path.join(certsDir, file);
      const mtime = fs.statSync(fullPath).mtimeMs;
      if (mtime < latestSigTime) {
        fs.unlinkSync(fullPath);
        invalidatedCount++;
      }
    }
    if (invalidatedCount > 0) {
      console.log(`[SignatureProcessor] Invalidated ${invalidatedCount} stale certificate PDF(s) to apply latest signatures.`);
    }
  } catch (err) {
    console.error('Error invalidating stale certificates:', err.message);
  }
}

module.exports = {
  getLatestSignatureMtime,
  cleanPngBuffer,
  cleanSignatureImage,
  invalidateStaleSignedCertificates,
};
