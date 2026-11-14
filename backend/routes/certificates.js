const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const qrcode = require('qrcode');
const archiver = require('archiver');
const nodemailer = require('nodemailer');

const Student = require('../models/Student');
const CourseDetail = require('../models/CourseDetail');
const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Batch = require('../models/Batch');
const CertificateBatch = require('../models/CertificateBatch');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateCertificatePDF } = require('../utils/pdfGenerator');
const { resolveTemplateFile } = require('../utils/certificateTemplates');
const { buildSearchRegex } = require('../utils/regexSafe');
const rateLimit = require('express-rate-limit');

// Rate limiters for certificate endpoints
const certRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests. Please try again later.' }
});

const certDownloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many download requests. Please try again later.' }
});

const certVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many verification attempts. Please try again later.' }
});

// Ensure upload/certificates directory exists
const certsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// Multer configurations for Excel uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed!'));
  }
});

// Multer configuration for signature uploads (PNG, JPG, WEBP)
const imgUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpg|jpeg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Only PNG, JPG, or WEBP image files are allowed for signatures!'));
  }
});

// Helper for unique ID generation
// Format: CERT-YYYY-XXXXXX
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CERT-${year}-${randomStr}`;
};

// Helper: Send certificate email via SMTP if configured
const sendCertificateEmail = async (student, certId, pdfPath) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_HOST) {
    return; // Email SMTP not configured
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Slog Solutions Platform" <noreply@slogsolutions.com>',
      to: student.email,
      subject: `Training Certificate of Completion - ${student.name}`,
      text: `Hello ${student.name},\n\nCongratulations on successfully completing your training! Please find attached your Certificate of Completion (Certificate ID: ${certId}).\n\nYou can verify this certificate online at the link below.\n\nBest Regards,\nSlog Solutions Team`,
      attachments: [
        {
          filename: `Certificate_${student.name.replace(/\s+/g, '_')}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Certificate email sent to ${student.email}`);
  } catch (error) {
    console.error(`Failed to send certificate email to ${student.email}:`, error.message);
  }
};

/* ==========================================
   1. TEMPLATE MANAGEMENT
   ========================================== */

// @route   GET /api/certificates/templates
router.get('/templates', certRateLimiter, requireAuth, async (req, res) => {
  try {
    const templates = await CertificateTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/templates
router.post('/templates', certRateLimiter, requireAuth, async (req, res) => {
  const { name, htmlContent, isDefault } = req.body;
  if (!name || !htmlContent) {
    return res.status(400).json({ error: 'Name and HTML content are required' });
  }

  try {
    if (isDefault) {
      // Unset previous defaults
      await CertificateTemplate.updateMany({}, { $set: { isDefault: false } });
    }

    const template = new CertificateTemplate({ name, htmlContent, isDefault: !!isDefault });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/certificates/templates/:id
router.put('/templates/:id', certRateLimiter, requireAuth, async (req, res) => {
  const { name, htmlContent, isDefault } = req.body;
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    if (name) template.name = name;
    if (htmlContent) template.htmlContent = htmlContent;

    if (isDefault !== undefined) {
      if (isDefault === true) {
        await CertificateTemplate.updateMany({}, { $set: { isDefault: false } });
      }
      template.isDefault = !!isDefault;
    }

    await template.save();
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/certificates/templates/:id
router.delete('/templates/:id', certRateLimiter, requireAuth, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    if (template.isDefault) {
      return res.status(400).json({ error: 'Cannot delete the default template. Set another template as default first.' });
    }

    await CertificateTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   2. EXCEL TEMPLATE DOWNLOADER & UPLOADER
   ========================================== */

// @route   GET /api/certificates/template-excel
// @desc    Download the Excel sample template
// @access  Private (Admin & Staff)
router.get('/template-excel', certDownloadLimiter, requireAuth, (req, res) => {
  try {
    // Generate simple excel with xlsx
    const data = [
      { 'Reg No': 'STP-YYYY-MM-DD-XXXXX', CourseCompletionDate: '2026-07-03' }
    ];
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template");

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Certificates_Import_Template.xlsx');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/upload
// @desc    Upload Excel sheet & issue bulk certificates
// @access  Private (Admin & Staff)
router.post('/upload', certRateLimiter, requireAuth, upload.single('excelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an Excel file' });
  }

  const forceReissue = req.body.forceReissue === 'true' || req.body.forceReissue === true;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ error: 'The uploaded Excel file contains no data' });
    }

    // Retrieve default certificate template
    let defaultTemplate = await CertificateTemplate.findOne({ isDefault: true });
    if (!defaultTemplate) {
      // Seed a default template if none exists
      defaultTemplate = new CertificateTemplate({
        name: 'Default Elegant Template',
        htmlContent: '<h1>Certificate for {{studentName}}</h1>',
        isDefault: true
      });
      await defaultTemplate.save();
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const failures = [];
    const successList = [];

    // Resolve incoming keys case-insensitively and space-insensitively
    const findValue = (rowObj, possibleKeys) => {
      const keys = Object.keys(rowObj);
      for (const pk of possibleKeys) {
        const normPk = pk.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normPk);
        if (matchKey !== undefined) {
          return rowObj[matchKey];
        }
      }
      return undefined;
    };

    const signatureOption = ['none', 'both', 'left', 'right'].includes(req.body.signatureOption)
      ? req.body.signatureOption
      : (req.body.includeSignatures === 'true' ? 'both' : 'none');

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      const rowNum = i + 2; // Row number in Excel (1-indexed + header row)

      const regNoVal = findValue(row, ['Reg No', 'RegistrationNo', 'Registration No', 'registrationNo', 'regNo']);
      const completionDateVal = findValue(row, ['CourseCompletionDate', 'courseCompletionDate', 'Completion Date', 'Course Completion Date', 'CompletionDate']);

      const regNo = regNoVal ? String(regNoVal).trim() : '';

      if (!regNo) {
        failures.push({ row: rowNum, registrationNo: 'N/A', reason: 'Missing registration number column (e.g. Reg No or RegistrationNo)' });
        continue;
      }

      // Parse completion date (optional, defaults to current date)
      let completionDate = new Date();
      if (completionDateVal !== undefined && completionDateVal !== null && String(completionDateVal).trim() !== '') {
        let parsedDate;
        if (typeof completionDateVal === 'number') {
          // Serial number from Excel (Excel epoch starts 1900-01-01)
          parsedDate = new Date(Math.round((completionDateVal - 25569) * 86400 * 1000));
        } else {
          parsedDate = new Date(completionDateVal);
        }
        if (!isNaN(parsedDate.getTime())) {
          completionDate = parsedDate;
        }
      }

      // Lookup student
      const student = await Student.findOne({ registrationNo: regNo })
        .populate('collegeId')
        .populate('branchId');

      if (!student) {
        failures.push({ row: rowNum, registrationNo: regNo, reason: 'Student registration number not found' });
        continue;
      }

      if (!student.isActive) {
        failures.push({ row: rowNum, registrationNo: regNo, reason: 'Student account is inactive/deactivated' });
        continue;
      }

      // Check duplicates
      const duplicate = await Certificate.findOne({ studentId: student._id });
      if (duplicate && !forceReissue) {
        failures.push({ row: rowNum, registrationNo: regNo, reason: 'Certificate already issued for this student (use force reissue to overwrite)' });
        continue;
      }

      // Fetch course detail
      const courseDetail = await CourseDetail.findById(student.courseDetailId)
        .populate('technologyId')
        .populate('durationId');

      if (!courseDetail) {
        failures.push({ row: rowNum, registrationNo: regNo, reason: 'Course detail lookup failed for student' });
        continue;
      }

      try {
        const certificateId = duplicate ? duplicate.certificateId : generateCertificateId();
        const verificationUrl = `${clientUrl}/verify/${certificateId}`;

        // Create QR Code base64
        const qrCodeBase64 = await qrcode.toDataURL(verificationUrl);

        // Define output PDF file paths
        const filename = `${certificateId}.pdf`;
        const pdfPath = path.join(certsDir, filename);

        const unsignedFilename = `${certificateId}_unsigned.pdf`;
        const unsignedPdfPath = path.join(certsDir, unsignedFilename);

        // Always generate the unsigned version so it is immediately available
        await generateCertificatePDF(
          student,
          courseDetail,
          certificateId,
          qrCodeBase64,
          unsignedPdfPath,
          completionDate,
          'default.html',
          { signatureOption: 'none', includeLeft: false, includeRight: false }
        );

        // Initially write the main file as unsigned (if approval is pending, downloading will serve unsigned)
        fs.copyFileSync(unsignedPdfPath, pdfPath);

        const pdfUrl = `/uploads/certificates/${filename}`;
        const pdfUrlUnsigned = `/uploads/certificates/${unsignedFilename}`;

        const isNone = signatureOption === 'none';
        const signatureApprovalStatus = isNone ? 'NotRequired' : 'Pending';
        const leftStatus = isNone ? 'NotRequired' : (signatureOption === 'both' || signatureOption === 'left' ? 'Pending' : 'NotRequired');
        const rightStatus = isNone ? 'NotRequired' : (signatureOption === 'both' || signatureOption === 'right' ? 'Pending' : 'NotRequired');

        if (duplicate) {
          duplicate.templateId = defaultTemplate._id;
          duplicate.pdfUrl = pdfUrl;
          duplicate.pdfUrlUnsigned = pdfUrlUnsigned;
          duplicate.qrCodeUrl = qrCodeBase64;
          duplicate.issueDate = completionDate;
          duplicate.signatureOption = signatureOption;
          duplicate.signatureApprovalStatus = signatureApprovalStatus;
          duplicate.leftApproval = { status: leftStatus, approvedBy: null, approvedAt: null };
          duplicate.rightApproval = { status: rightStatus, approvedBy: null, approvedAt: null };
          await duplicate.save();
          successList.push(duplicate);
        } else {
          const newCert = new Certificate({
            certificateId,
            studentId: student._id,
            courseDetailId: courseDetail._id,
            templateId: defaultTemplate._id,
            pdfUrl,
            pdfUrlUnsigned,
            signatureOption,
            signatureApprovalStatus,
            leftApproval: { status: leftStatus, approvedBy: null, approvedAt: null },
            rightApproval: { status: rightStatus, approvedBy: null, approvedAt: null },
            qrCodeUrl: qrCodeBase64,
            issueDate: completionDate,
            status: 'Active'
          });
          await newCert.save();
          successList.push(newCert);
        }

        // Send Email automatically only if no signature approval is pending
        if (isNone) {
          await sendCertificateEmail(student, certificateId, pdfPath);
        }

      } catch (err) {
        console.error('PDF creation error for row', rowNum, err.message);
        failures.push({ row: rowNum, registrationNo: regNo, reason: `PDF generation failed: ${err.message}` });
      }
    }

    // Save batch log
    const batch = new CertificateBatch({
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      totalRows: sheetData.length,
      successCount: successList.length,
      failureCount: failures.length,
      failures,
      certificateIds: successList.map(c => c._id)
    });
    await batch.save();

    res.json({
      message: 'Processing complete',
      batchId: batch._id,
      totalRows: sheetData.length,
      successCount: successList.length,
      failureCount: failures.length,
      failures,
      successIds: successList.map(c => c._id)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Ensures that a certificate PDF exists on disk and is up to date with respect
 * to the latest uploaded signatures. If missing or stale, it regenerates the PDF.
 */
const ensureCertificatePdfOnDisk = async (cert) => {
  const { getLatestSignatureMtime } = require('../utils/signatureProcessor');
  const latestSigTime = getLatestSignatureMtime();
  const filename = `${cert.certificateId}.pdf`;
  const pdfPath = path.join(certsDir, filename);

  const isApprovedOrNotRequired = cert.signatureApprovalStatus === 'Approved' || cert.signatureApprovalStatus === 'NotRequired' || !cert.signatureApprovalStatus;
  const isNotRequired = cert.signatureApprovalStatus === 'NotRequired' || !cert.signatureApprovalStatus;
  const shouldHaveSignatures = isApprovedOrNotRequired && cert.signatureOption !== 'none';

  const fileExists = fs.existsSync(pdfPath);
  const approvedAtTime = Math.max(
    cert.leftApproval?.approvedAt ? new Date(cert.leftApproval.approvedAt).getTime() : 0,
    cert.rightApproval?.approvedAt ? new Date(cert.rightApproval.approvedAt).getTime() : 0
  );
  const pdfMtime = fileExists ? fs.statSync(pdfPath).mtimeMs : 0;
  const isStale = fileExists && shouldHaveSignatures && pdfMtime < latestSigTime;
  const needsRegenForApproval = fileExists && cert.signatureApprovalStatus === 'Approved' && approvedAtTime > 0 && pdfMtime < approvedAtTime;

  if (!fileExists || isStale || needsRegenForApproval) {
    let studentData = cert.studentId;
    let courseDetailData = cert.courseDetailId;

    if (!studentData || !courseDetailData || !studentData.collegeId) {
      if (cert.studentId?._id || cert.studentId) {
        studentData = await Student.findById(cert.studentId._id || cert.studentId)
          .populate('collegeId')
          .populate('branchId');
      }
      if (cert.courseDetailId?._id || cert.courseDetailId) {
        courseDetailData = await CourseDetail.findById(cert.courseDetailId._id || cert.courseDetailId)
          .populate('technologyId')
          .populate('durationId');
      }
    }

    if (!studentData || !courseDetailData) {
      const User = require('../models/User');
      const user = cert.userId ? await User.findById(cert.userId) : null;
      const batch = cert.batchId ? await Batch.findById(cert.batchId) : null;
      const { buildBatchCertificateData } = require('../utils/certificateData');
      ({ studentData, courseDetailData } = buildBatchCertificateData({ user, student: studentData, courseDetail: courseDetailData, batch }));
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify/${cert.certificateId}`;
    const qrCodeBase64 = cert.qrCodeUrl || (await qrcode.toDataURL(verificationUrl));

    const sigConfig = isApprovedOrNotRequired
      ? {
          signatureOption: cert.signatureOption || 'both',
          includeLeft: isNotRequired || cert.leftApproval?.status === 'Approved',
          includeRight: isNotRequired || cert.rightApproval?.status === 'Approved'
        }
      : { signatureOption: 'none', includeLeft: false, includeRight: false };

    await generateCertificatePDF(
      studentData,
      courseDetailData,
      cert.certificateId,
      qrCodeBase64,
      pdfPath,
      cert.issueDate || new Date(),
      cert.templateFile || 'default.html',
      sigConfig
    );
  }

  return pdfPath;
};

// @route   GET /api/certificates/batch/:batchId/download-zip
// @desc    Download all PDFs generated in a batch zipped together
// @access  Private (Admin & Staff & Director)
router.get('/batch/:batchId/download-zip', certDownloadLimiter, requireAuth, async (req, res) => {
  try {
    const batch = await CertificateBatch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch record not found' });
    }

    // The batch stores exactly which certificates it produced, so we look those up directly, allowing only Active ones.
    const certs = await Certificate.find({ _id: { $in: batch.certificateIds || [] }, status: 'Active' });

    if (certs.length === 0) {
      return res.status(404).json({ error: 'No active certificates found for this batch' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=Certificates_Batch_${batch._id}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const cert of certs) {
      try {
        let pdfPath = await ensureCertificatePdfOnDisk(cert);
        if (!fs.existsSync(pdfPath) && cert.pdfUrlUnsigned) {
          const unsignedPath = path.join(__dirname, '..', cert.pdfUrlUnsigned);
          if (fs.existsSync(unsignedPath)) {
            pdfPath = unsignedPath;
          }
        }
        if (fs.existsSync(pdfPath)) {
          archive.file(pdfPath, { name: `${cert.certificateId}.pdf` });
        }
      } catch (certErr) {
        console.error(`Error processing cert ${cert.certificateId} for batch ZIP:`, certErr.message);
        if (cert.pdfUrlUnsigned) {
          const unsignedPath = path.join(__dirname, '..', cert.pdfUrlUnsigned);
          if (fs.existsSync(unsignedPath)) {
            archive.file(unsignedPath, { name: `${cert.certificateId}.pdf` });
          }
        }
      }
    }

    await archive.finalize();

  } catch (err) {
    console.error('ZIP generation error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// @route   GET /api/certificates/download-all-zip
// @desc    Download all active certificates packaged as a ZIP
// @access  Private (Admin & Staff & Director)
router.get('/download-all-zip', certDownloadLimiter, requireAuth, async (req, res) => {
  try {
    const certs = await Certificate.find({ status: 'Active' });

    if (certs.length === 0) {
      return res.status(404).json({ error: 'No active certificates found to download.' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=All_Certificates.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const cert of certs) {
      try {
        let pdfPath = await ensureCertificatePdfOnDisk(cert);
        if (!fs.existsSync(pdfPath) && cert.pdfUrlUnsigned) {
          const unsignedPath = path.join(__dirname, '..', cert.pdfUrlUnsigned);
          if (fs.existsSync(unsignedPath)) {
            pdfPath = unsignedPath;
          }
        }
        if (fs.existsSync(pdfPath)) {
          archive.file(pdfPath, { name: `${cert.certificateId}.pdf` });
        }
      } catch (certErr) {
        console.error(`Error processing cert ${cert.certificateId} for all ZIP:`, certErr.message);
        if (cert.pdfUrlUnsigned) {
          const unsignedPath = path.join(__dirname, '..', cert.pdfUrlUnsigned);
          if (fs.existsSync(unsignedPath)) {
            archive.file(unsignedPath, { name: `${cert.certificateId}.pdf` });
          }
        }
      }
    }

    await archive.finalize();

  } catch (err) {
    console.error('All ZIP generation error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

/* ==========================================
   SIGNATURE ASSETS MANAGEMENT
   ========================================== */

// @route   GET /api/certificates/signatures
// @desc    Get currently configured signatures and director details
// @access  Private
router.get('/signatures', certRateLimiter, requireAuth, async (req, res) => {
  try {
    const signaturesDir = path.join(__dirname, '../uploads/signatures');
    const leftPath = path.join(signaturesDir, 'left_signature.png');
    const rightPath = path.join(signaturesDir, 'right_signature.png');

    const SystemSetting = require('../models/SystemSetting');
    const leftNameSetting = await SystemSetting.findOne({ key: 'left_sign_name' });
    const rightNameSetting = await SystemSetting.findOne({ key: 'right_sign_name' });

    const leftSignName = leftNameSetting?.value || process.env.LEFT_SIGN_NAME || 'Suraj Prasad Singh';
    const rightSignName = rightNameSetting?.value || process.env.RIGHT_SIGN_NAME || 'Kiran Bisht';

    const toDataUri = (filePath) => {
      if (!filePath || !fs.existsSync(filePath)) return '';
      const ext = path.extname(filePath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
    };

    res.json({
      leftSignName,
      rightSignName,
      leftSignatureUrl: toDataUri(leftPath),
      rightSignatureUrl: toDataUri(rightPath),
      hasLeftSignature: fs.existsSync(leftPath),
      hasRightSignature: fs.existsSync(rightPath)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/signatures
// @desc    Upload new Left/Right signature image files & update director names
// @access  Private (Admin & Director)
router.post(
  '/signatures',
  certRateLimiter,
  requireAuth,
  requireRole(['Admin', 'Director']),
  imgUpload.fields([
    { name: 'leftSignature', maxCount: 1 },
    { name: 'rightSignature', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const signaturesDir = path.join(__dirname, '../uploads/signatures');
      if (!fs.existsSync(signaturesDir)) {
        fs.mkdirSync(signaturesDir, { recursive: true });
      }

      const { cleanSignatureImage, invalidateStaleSignedCertificates } = require('../utils/signatureProcessor');

      if (req.files?.leftSignature && req.files.leftSignature[0]) {
        const leftTarget = path.join(signaturesDir, 'left_signature.png');
        const tempRaw = path.join(signaturesDir, `left_raw_${Date.now()}.png`);
        fs.writeFileSync(tempRaw, req.files.leftSignature[0].buffer);
        const cleaned = cleanSignatureImage(tempRaw, leftTarget);
        if (!cleaned) {
          fs.writeFileSync(leftTarget, req.files.leftSignature[0].buffer);
        }
        try { if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw); } catch (_) {}
      }

      if (req.files?.rightSignature && req.files.rightSignature[0]) {
        const rightTarget = path.join(signaturesDir, 'right_signature.png');
        const tempRaw = path.join(signaturesDir, `right_raw_${Date.now()}.png`);
        fs.writeFileSync(tempRaw, req.files.rightSignature[0].buffer);
        const cleaned = cleanSignatureImage(tempRaw, rightTarget);
        if (!cleaned) {
          fs.writeFileSync(rightTarget, req.files.rightSignature[0].buffer);
        }
        try { if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw); } catch (_) {}
      }

      // Invalidate existing signed certificates so they automatically take the new signature
      invalidateStaleSignedCertificates();

      const SystemSetting = require('../models/SystemSetting');
      if (req.body.leftSignName && req.body.leftSignName.trim()) {
        await SystemSetting.findOneAndUpdate(
          { key: 'left_sign_name' },
          { value: req.body.leftSignName.trim() },
          { upsert: true, new: true }
        );
      }

      if (req.body.rightSignName && req.body.rightSignName.trim()) {
        await SystemSetting.findOneAndUpdate(
          { key: 'right_sign_name' },
          { value: req.body.rightSignName.trim() },
          { upsert: true, new: true }
        );
      }

      res.json({ message: 'Director signatures and names updated successfully!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route   POST /api/certificates/bulk-toggle
// @desc    Bulk toggle status (Active/Revoked) for certificates
// @access  Private (Admin & Staff)
router.post('/bulk-toggle', certRateLimiter, requireAuth, requireRole(['Admin']), async (req, res) => {
  const { ids, status, search } = req.body;
  if (!status || !['Active', 'Revoked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing target status' });
  }

  try {
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await Certificate.updateMany(
        { _id: { $in: ids } },
        { $set: { status } }
      );
    } else {
      let filter = {};
      if (search) {
        const searchRegex = buildSearchRegex(search);
        const students = await Student.find({
          $or: [
            { name: searchRegex },
            { registrationNo: searchRegex }
          ]
        }).select('_id');
        const studentIds = students.map(s => s._id);

        filter.$or = [
          { certificateId: searchRegex },
          { studentId: { $in: studentIds } }
        ];
      }
      await Certificate.updateMany(filter, { $set: { status } });
    }
    res.json({ message: 'Certificates status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/bulk-delete
// @desc    Delete multiple certificates and clean up PDF files from disk
// @access  Private (Admin & Staff)
router.post('/bulk-delete', certRateLimiter, requireAuth, requireRole(['Admin']), async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No certificate records selected for deletion' });
  }

  try {
    const certs = await Certificate.find({ _id: { $in: ids } });
    for (const cert of certs) {
      if (cert.pdfUrl) {
        const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
        if (fs.existsSync(pdfPath)) {
          try { fs.unlinkSync(pdfPath); } catch (e) { console.error('Failed to delete PDF file:', e.message); }
        }
      }
    }
    await Certificate.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Selected certificate records deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ==========================================
   3. STUDENT — MY CERTIFICATES
   ========================================== */

// @route   GET /api/certificates/my
// @desc    Get the logged-in student's own certificate(s)
// @access  Private (Student)
router.get('/my', certRateLimiter, requireAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');

    // Match User → Student by email or username ↔ registrationNo
    const student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { registrationNo: req.user.username }
      ]
    });

    const queryConditions = [{ userId: req.user._id }];
    if (student) {
      queryConditions.push({ studentId: student._id });
    }

    const certs = await Certificate.find({
      $or: queryConditions,
      status: 'Active'
    })
      .populate({
        path: 'studentId',
        select: 'name registrationNo email phone fatherName dob gender address state year trainingType',
        populate: [
          { path: 'collegeId', select: 'collegeName cityName' },
          { path: 'branchId', select: 'branchName' }
        ]
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      })
      .populate({
        path: 'batchId',
        select: 'name batchId'
      })
      .sort({ createdAt: -1 });

    res.json({
      certificates: certs,
      hasStudent: !!student,
      studentRegistrationNo: student ? student.registrationNo : (req.user.username || 'N/A')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   4. CERTIFICATES LISTING
   ========================================== */

// @route   GET /api/certificates
// @desc    Get all certificates (with search, pagination)
// @access  Private (Admin & Staff)
router.get('/', certRateLimiter, requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = buildSearchRegex(req.query.search);

    // Find students matching search to filter certificates
    const students = await Student.find({
      $or: [
        { name: searchRegex },
        { registrationNo: searchRegex }
      ]
    }).select('_id');
    const studentIds = students.map(s => s._id);

    filter.$or = [
      { certificateId: searchRegex },
      { studentId: { $in: studentIds } }
    ];
  }

  if (req.query.status) {
    const allowedStatuses = ['Active', 'Revoked'];
    if (typeof req.query.status !== 'string' || !allowedStatuses.includes(req.query.status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    filter.status = req.query.status;
  }

  if (req.query.signatureApprovalStatus) {
    const allowedSignatureStatuses = ['NotRequired', 'Pending', 'PartiallyApproved', 'Approved', 'Rejected'];
    if (typeof req.query.signatureApprovalStatus !== 'string' || !allowedSignatureStatuses.includes(req.query.signatureApprovalStatus)) {
      return res.status(400).json({ error: 'Invalid signature approval status filter' });
    }
    filter.signatureApprovalStatus = req.query.signatureApprovalStatus;
  }

  try {
    const total = await Certificate.countDocuments(filter);
    const certs = await Certificate.find(filter)
      .populate({
        path: 'studentId',
        select: 'name registrationNo phone email',
        populate: { path: 'collegeId', select: 'collegeName cityName' }
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      })
      .populate('leftApproval.approvedBy', 'name username')
      .populate('rightApproval.approvedBy', 'name username')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: certs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/certificates/:id
// @desc    Toggle active status (Revoke/Activate) or regenerate certificate PDF
// @access  Private (Admin & Staff)
router.put('/:id', certRateLimiter, requireAuth, async (req, res) => {
  const { status, regenerate } = req.body;
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('studentId')
      .populate('courseDetailId');

    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    if (status) {
      cert.status = status;
    }

    if (regenerate) {
      // Re-run PDF generation
      const student = await Student.findById(cert.studentId._id)
        .populate('collegeId')
        .populate('branchId');

      const courseDetail = await CourseDetail.findById(cert.courseDetailId._id)
        .populate('technologyId')
        .populate('durationId');

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify/${cert.certificateId}`;
      const qrCodeBase64 = await qrcode.toDataURL(verificationUrl);

      const filename = `${cert.certificateId}.pdf`;
      const pdfPath = path.join(certsDir, filename);

      const batch = cert.batchId ? await Batch.findById(cert.batchId).select('certificateTemplate') : null;

      // Overwrite the existing PDF file
      await generateCertificatePDF(
        student,
        courseDetail,
        cert.certificateId,
        qrCodeBase64,
        pdfPath,
        new Date(), // current completion or date issued
        batch?.certificateTemplate
      );

      cert.qrCodeUrl = qrCodeBase64;
      cert.templateFile = resolveTemplateFile(batch?.certificateTemplate);
    }

    await cert.save();

    const populated = await Certificate.findById(cert._id)
      .populate({
        path: 'studentId',
        select: 'name registrationNo phone email'
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete certificate record and clean up file from disk
// @access  Private (Admin & Staff)
router.delete('/:id', certRateLimiter, requireAuth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    // Delete PDF file from disk
    const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
    if (fs.existsSync(pdfPath)) {
      try { fs.unlinkSync(pdfPath); } catch (e) { console.error('Failed to delete PDF file:', e.message); }
    }

    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate deleted and file removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   4. DIRECTOR SIGNATURE APPROVAL WORKFLOW
   ========================================== */

// @route   GET /api/certificates/pending-approvals
// @desc    Get certificates with pending signature approvals
// @access  Private (Director & Admin)
router.get('/pending-approvals', certRateLimiter, requireAuth, requireRole(['Director', 'Admin']), async (req, res) => {
  try {
    const filter = { signatureApprovalStatus: 'Pending', status: 'Active' };

    // If a Director is logged in, show requests where their signature is still Pending
    if (req.user.role === 'Director') {
      const uname = req.user.username.toLowerCase();
      if (uname === 'suraj') {
        filter['leftApproval.status'] = 'Pending';
      } else if (uname === 'kiran') {
        filter['rightApproval.status'] = 'Pending';
      }
    }

    const certs = await Certificate.find(filter)
      .populate({
        path: 'studentId',
        select: 'name registrationNo phone email',
        populate: { path: 'collegeId', select: 'collegeName cityName' }
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      })
      .populate('userId', 'name username')
      .populate('batchId', 'name')
      .populate('leftApproval.approvedBy', 'name username')
      .populate('rightApproval.approvedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/:id/approve-signature
// @desc    Approve or reject signature for a certificate
// @access  Private (Director & Admin)
router.post('/:id/approve-signature', certRateLimiter, requireAuth, requireRole(['Director', 'Admin']), async (req, res) => {
  const { action = 'approve', side } = req.body; // action: 'approve' | 'reject', side: 'left' | 'right' | 'both'
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: [{ path: 'collegeId' }, { path: 'branchId' }]
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    // Determine target side:
    // Suraj can approve left signature
    // Kiran can approve right signature
    // Admin can approve either or both
    let targetSide = side;
    if (req.user.role === 'Director') {
      const uname = req.user.username.toLowerCase();
      if (uname === 'suraj') targetSide = 'left';
      else if (uname === 'kiran') targetSide = 'right';
    }

    const newStatus = action === 'reject' ? 'Rejected' : 'Approved';

    if (targetSide === 'left' || targetSide === 'both' || !targetSide) {
      if (cert.leftApproval && cert.leftApproval.status === 'Pending') {
        cert.leftApproval.status = newStatus;
        cert.leftApproval.approvedBy = req.user._id;
        cert.leftApproval.approvedAt = new Date();
      }
    }

    if (targetSide === 'right' || targetSide === 'both' || !targetSide) {
      if (cert.rightApproval && cert.rightApproval.status === 'Pending') {
        cert.rightApproval.status = newStatus;
        cert.rightApproval.approvedBy = req.user._id;
        cert.rightApproval.approvedAt = new Date();
      }
    }

    // Determine overall signatureApprovalStatus:
    if (cert.leftApproval.status === 'Rejected' || cert.rightApproval.status === 'Rejected') {
      cert.signatureApprovalStatus = 'Rejected';
    } else {
      if (cert.signatureOption === 'both') {
        if (cert.leftApproval.status === 'Approved' && cert.rightApproval.status === 'Approved') {
          cert.signatureApprovalStatus = 'Approved';
        } else {
          cert.signatureApprovalStatus = 'Pending';
        }
      } else if (cert.signatureOption === 'left') {
        if (cert.leftApproval.status === 'Approved') {
          cert.signatureApprovalStatus = 'Approved';
        }
      } else if (cert.signatureOption === 'right') {
        if (cert.rightApproval.status === 'Approved') {
          cert.signatureApprovalStatus = 'Approved';
        }
      }
    }

    // If fully approved, regenerate the main certificate PDF with the approved signatures!
    if (cert.signatureApprovalStatus === 'Approved') {
      let studentData = cert.studentId;
      let courseDetailData = cert.courseDetailId;
      if (!studentData || !courseDetailData) {
        const User = require('../models/User');
        const user = cert.userId ? await User.findById(cert.userId) : null;
        const batch = cert.batchId ? await Batch.findById(cert.batchId) : null;
        const { buildBatchCertificateData } = require('../utils/certificateData');
        ({ studentData, courseDetailData } = buildBatchCertificateData({ user, student: studentData, courseDetail: courseDetailData, batch }));
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify/${cert.certificateId}`;
      const qrCodeBase64 = cert.qrCodeUrl || (await qrcode.toDataURL(verificationUrl));
      const filename = `${cert.certificateId}.pdf`;
      const pdfPath = path.join(certsDir, filename);

      await generateCertificatePDF(
        studentData,
        courseDetailData,
        cert.certificateId,
        qrCodeBase64,
        pdfPath,
        cert.issueDate,
        cert.templateFile || 'default.html',
        {
          signatureOption: cert.signatureOption,
          includeLeft: cert.leftApproval?.status === 'Approved',
          includeRight: cert.rightApproval?.status === 'Approved'
        }
      );

      // Send email now that certificate is officially signed & approved!
      if (studentData && studentData.email) {
        await sendCertificateEmail(studentData, cert.certificateId, pdfPath);
      }
    }

    await cert.save();
    res.json({ message: `Certificate signature ${newStatus.toLowerCase()} successfully`, certificate: cert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/bulk-approve-signatures
// @desc    Bulk approve or reject signatures
// @access  Private (Director & Admin)
router.post('/bulk-approve-signatures', certRateLimiter, requireAuth, requireRole(['Director', 'Admin']), async (req, res) => {
  const { ids, action = 'approve' } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Please provide certificate IDs' });
  }

  try {
    const certs = await Certificate.find({ _id: { $in: ids } })
      .populate({
        path: 'studentId',
        populate: [{ path: 'collegeId' }, { path: 'branchId' }]
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    let approvedCount = 0;
    const newStatus = action === 'reject' ? 'Rejected' : 'Approved';

    for (const cert of certs) {
      let targetSide = 'both';
      if (req.user.role === 'Director') {
        const uname = req.user.username.toLowerCase();
        if (uname === 'suraj') targetSide = 'left';
        else if (uname === 'kiran') targetSide = 'right';
      }

      if (targetSide === 'left' || targetSide === 'both') {
        if (cert.leftApproval && cert.leftApproval.status === 'Pending') {
          cert.leftApproval.status = newStatus;
          cert.leftApproval.approvedBy = req.user._id;
          cert.leftApproval.approvedAt = new Date();
        }
      }

      if (targetSide === 'right' || targetSide === 'both') {
        if (cert.rightApproval && cert.rightApproval.status === 'Pending') {
          cert.rightApproval.status = newStatus;
          cert.rightApproval.approvedBy = req.user._id;
          cert.rightApproval.approvedAt = new Date();
        }
      }

      if (cert.leftApproval.status === 'Rejected' || cert.rightApproval.status === 'Rejected') {
        cert.signatureApprovalStatus = 'Rejected';
      } else {
        if (cert.signatureOption === 'both') {
          if (cert.leftApproval.status === 'Approved' && cert.rightApproval.status === 'Approved') {
            cert.signatureApprovalStatus = 'Approved';
          }
        } else if (cert.signatureOption === 'left' && cert.leftApproval.status === 'Approved') {
          cert.signatureApprovalStatus = 'Approved';
        } else if (cert.signatureOption === 'right' && cert.rightApproval.status === 'Approved') {
          cert.signatureApprovalStatus = 'Approved';
        }
      }

      if (cert.signatureApprovalStatus === 'Approved') {
        let studentData = cert.studentId;
        let courseDetailData = cert.courseDetailId;
        if (!studentData || !courseDetailData) {
          const User = require('../models/User');
          const user = cert.userId ? await User.findById(cert.userId) : null;
          const batch = cert.batchId ? await Batch.findById(cert.batchId) : null;
          const { buildBatchCertificateData } = require('../utils/certificateData');
          ({ studentData, courseDetailData } = buildBatchCertificateData({ user, student: studentData, courseDetail: courseDetailData, batch }));
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationUrl = `${clientUrl}/verify/${cert.certificateId}`;
        const qrCodeBase64 = cert.qrCodeUrl || (await qrcode.toDataURL(verificationUrl));
        const filename = `${cert.certificateId}.pdf`;
        const pdfPath = path.join(certsDir, filename);

        try {
          await generateCertificatePDF(
            studentData,
            courseDetailData,
            cert.certificateId,
            qrCodeBase64,
            pdfPath,
            cert.issueDate,
            cert.templateFile || 'default.html',
            {
              signatureOption: cert.signatureOption,
              includeLeft: cert.leftApproval?.status === 'Approved',
              includeRight: cert.rightApproval?.status === 'Approved'
            }
          );
        } catch (e) {
          console.error(`Failed to generate signed PDF for ${cert.certificateId}:`, e.message);
        }
      }

      await cert.save();
      approvedCount++;
    }

    res.json({ message: `Processed ${approvedCount} certificate signature approvals successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   4. PUBLIC CERTIFICATE VERIFICATION
   ========================================== */

// @route   GET /api/certificates/verify/:identifier
// @desc    Public verification of a certificate by Certificate ID or student Registration No
// @access  Public
router.get('/verify/:identifier', certVerifyLimiter, async (req, res) => {
  try {
    const identifier = String(req.params.identifier || '').trim();
    // IDs are stored uppercase; also try the uppercased input so lowercase entry still matches.
    const candidates = [...new Set([identifier, identifier.toUpperCase()])];

    const withDetails = (query) => query
      .populate({
        path: 'studentId',
        select: 'name registrationNo candidateInfo'
      })
      .populate({
        path: 'userId',
        select: 'name username'
      })
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    let cert = await withDetails(Certificate.findOne({ certificateId: { $in: candidates } }));

    if (!cert) {
      const student = await Student.findOne({ registrationNo: { $in: candidates } }).select('_id');
      if (student) {
        // A student can hold several certificates: prefer Active ('Active' sorts before 'Revoked'), then newest.
        cert = await withDetails(Certificate.findOne({ studentId: student._id }).sort({ status: 1, issueDate: -1 }));
      }
    }

    if (!cert) {
      return res.status(404).json({
        verified: false,
        error: 'No matching certificate found for the provided Certificate ID or Registration Number'
      });
    }

    const studentName = cert.userId?.name || cert.studentId?.name || 'N/A';
    const registrationNo = cert.studentId?.registrationNo || cert.userId?.username || cert.certificateId;

    // ── Build absolute PDF URL so the browser opens the correct host ──
    // In production behind nginx: https://www.slogsolutions.com/uploads/...
    // Locally: http://localhost:5001/uploads/...
    let absolutePdfUrl = '';
    if (cert.status === 'Active' && cert.pdfUrl) {
      if (cert.pdfUrl.startsWith('http')) {
        // Already absolute (e.g. Cloudinary CDN URLs)
        absolutePdfUrl = cert.pdfUrl;
      } else {
        const relativePath = cert.pdfUrl.startsWith('/') ? cert.pdfUrl : `/${cert.pdfUrl}`;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        absolutePdfUrl = `${baseUrl}${relativePath}`;
      }
    }

    res.json({
      verified: true,
      certificateId: cert.certificateId,
      studentName,
      registrationNo,
      courseName: cert.courseDetailId?.technologyId ? cert.courseDetailId.technologyId.name : 'N/A',
      duration: cert.courseDetailId?.durationId
        ? `${cert.courseDetailId.durationId.value} ${cert.courseDetailId.durationId.unit}(s)`
        : 'N/A',
      issueDate: cert.issueDate,
      status: cert.status,
      pdfUrl: absolutePdfUrl
    });
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

module.exports = router;
