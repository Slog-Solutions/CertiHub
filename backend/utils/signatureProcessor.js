const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Strips paper background, extracts textual ink strokes, and saves as transparent PNG.
 * Uses PowerShell System.Drawing on Windows or falls back gracefully.
 *
 * @param {string} inputPath
 * @param {string} outputPath
 */
function cleanSignatureImage(inputPath, outputPath) {
  try {
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
  cleanSignatureImage,
  invalidateStaleSignedCertificates,
};
