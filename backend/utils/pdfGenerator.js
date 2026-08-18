const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

/**
 * Finds an installed Chrome or Edge browser on Windows.
 */
function findBrowserExecutable() {
  if (process.env.CHROME_EXECUTABLE && fs.existsSync(process.env.CHROME_EXECUTABLE)) {
    return process.env.CHROME_EXECUTABLE;
  }
  const candidates = [
    // Linux paths (Hostinger VPS / Ubuntu)
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    // Windows paths
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
      : '',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      : '',
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error(
    'No Chrome/Edge browser found. Install Google Chrome or set CHROME_EXECUTABLE in .env'
  );
}

/**
 * Convert a file path to a base64 data URI.
 */
function toDataUri(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return '';
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };
    const mime = mimeMap[ext] || 'image/jpeg';
    const data = fs.readFileSync(filePath);
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch (e) {
    return '';
  }
}

/**
 * Generates a certificate PDF using Puppeteer-core + the HTML template from the zip.
 *
 * @param {Object}  student        - Mongoose Student document (populated)
 * @param {Object}  courseDetail   - Mongoose CourseDetail doc (populated technologyId, durationId)
 * @param {String}  certificateId  - Unique certificate ID string
 * @param {String}  qrCodeBase64   - QR code data URI (kept for API compatibility)
 * @param {String}  outputPath     - Absolute file path to write the PDF
 * @param {Date}    completionDate - Completion / issue date
 * @returns {Promise<String>}      - Resolves with outputPath
 */
const generateCertificatePDF = async (student, courseDetail, certificateId, qrCodeBase64, outputPath, completionDate) => {
  const backendDir = path.join(__dirname, '..');

  // ── 1. Load HTML template ──────────────────────────────────────────────
  const templatePath = path.join(backendDir, 'templates', 'default.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Certificate template not found at: ${templatePath}`);
  }
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  // ── 2. Asset paths — mirrors the zip's public/images structure ────────
  const bgPath       = path.join(backendDir, 'templates', 'certificate_bg.jpg');
  const leftSigPath  = path.join(backendDir, 'uploads', 'signatures', 'left_signature.png');
  const rightSigPath = path.join(backendDir, 'uploads', 'signatures', 'right_signature.png');

  const bgUrl       = toDataUri(bgPath);
  const leftSigUrl  = toDataUri(leftSigPath);
  const rightSigUrl = toDataUri(rightSigPath);

  // ── 3. Build template data — same keys the zip template expects ────────
  const companyName = process.env.COMPANY_NAME
    || (student.collegeId ? student.collegeId.collegeName : 'SLOG Solutions Private Limited');
  const websiteUrl  = process.env.WEBSITE_URL || 'www.slogsolutions.com';

  const courseName  = courseDetail.technologyId ? courseDetail.technologyId.name.toUpperCase() : 'TRAINING PROGRAM';
  const durationVal = courseDetail.durationId
    ? `${courseDetail.durationId.value} ${courseDetail.durationId.unit}(s)`
    : '';

  const issueDate   = new Date(completionDate || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const showSignatures = student.collegeId ? student.collegeId.showSignature !== false : true;

  const templateData = {
    // These keys EXACTLY match the zip's default.html placeholders
    student_name:         (student.name || '').toUpperCase(),
    course_name:          courseName,
    duration_label:       durationVal,
    issue_date:           issueDate,
    company_name:         companyName,
    registration_id:      student.registrationNo || certificateId,
    website_url:          websiteUrl,
    bgUrl,
    include_signatures:   showSignatures ? [{}] : [],
    left_signature_url:   leftSigUrl  || null,
    right_signature_url:  rightSigUrl || null,
    left_sign_name:       process.env.LEFT_SIGN_NAME  || 'Suraj Prasad Singh',
    right_sign_name:      process.env.RIGHT_SIGN_NAME || 'Kiran Bisht',
  };

  // ── 4. Render Mustache template ───────────────────────────────────────
  const renderedHtml = Mustache.render(templateHtml, templateData);

  // ── 5. Launch Puppeteer with system browser ──────────────────────────
  const executablePath = findBrowserExecutable();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  let page;
  try {
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(15000);
    await page.setViewport({ width: 2480, height: 1754, deviceScaleFactor: 1.5 });

    await page.setContent(renderedHtml, {
      waitUntil: ['domcontentloaded', 'load'],
      timeout: 12000,
    });

    // Wait for background image + signature images to load
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.race([
        Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload  = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000);
          });
        })),
        new Promise(resolve => setTimeout(resolve, 5000)),
      ]);
    });

    // A4 Landscape PDF — full bleed, no margins
    const pdfBuffer = await page.pdf({
      width:               '297mm',
      height:              '210mm',
      printBackground:     true,
      landscape:           true,
      margin:              { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize:   false,
      scale:               1,
      displayHeaderFooter: false,
    });

    await page.close();
    await browser.close();

    fs.writeFileSync(outputPath, pdfBuffer);
    return outputPath;

  } catch (err) {
    if (page) { try { await page.close(); } catch (_) {} }
    try { await browser.close(); } catch (_) {}
    throw err;
  }
};

module.exports = { generateCertificatePDF };
