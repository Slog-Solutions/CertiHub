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
router.get('/templates', requireAuth, async (req, res) => {
  try {
    const templates = await CertificateTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/certificates/templates
router.post('/templates', requireAuth, async (req, res) => {
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
router.put('/templates/:id', requireAuth, async (req, res) => {
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
router.delete('/templates/:id', requireAuth, async (req, res) => {
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
router.get('/template-excel', requireAuth, (req, res) => {
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
router.post('/upload', requireAuth, upload.single('excelFile'), async (req, res) => {
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

        // Define output PDF file path
        const filename = `${certificateId}.pdf`;
        const pdfPath = path.join(certsDir, filename);

        // Generate PDF certificate via PDFKit layout helper
        await generateCertificatePDF(
          student,
          courseDetail,
          certificateId,
          qrCodeBase64,
          pdfPath,
          completionDate
        );

        const pdfUrl = `/uploads/certificates/${filename}`;

        if (duplicate) {
          duplicate.templateId = defaultTemplate._id;
          duplicate.pdfUrl = pdfUrl;
          duplicate.qrCodeUrl = qrCodeBase64;
          duplicate.issueDate = completionDate;
          await duplicate.save();
          successList.push(duplicate);
        } else {
          const newCert = new Certificate({
            certificateId,
            studentId: student._id,
            courseDetailId: courseDetail._id,
            templateId: defaultTemplate._id,
            pdfUrl,
            qrCodeUrl: qrCodeBase64,
            issueDate: completionDate,
            status: 'Active'
          });
          await newCert.save();
          successList.push(newCert);
        }

        // Send Email automatically if configured
        await sendCertificateEmail(student, certificateId, pdfPath);

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

// @route   GET /api/certificates/batch/:batchId/download-zip
// @desc    Download all PDFs generated in a batch zipped together
// @access  Private (Admin & Staff)
router.get('/batch/:batchId/download-zip', requireAuth, async (req, res) => {
  try {
    const batch = await CertificateBatch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // The batch stores exactly which certificates it produced, so we look those up directly, allowing only Active ones.
    const certs = await Certificate.find({ _id: { $in: batch.certificateIds || [] }, status: 'Active' });

    if (certs.length === 0) {
      return res.status(404).json({ error: 'No certificates found for this batch' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=Certificates_Batch_${batch._id}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const cert of certs) {
      const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        archive.file(pdfPath, { name: `${cert.certificateId}.pdf` });
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
// @access  Private (Admin & Staff)
router.get('/download-all-zip', requireAuth, async (req, res) => {
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
      const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        archive.file(pdfPath, { name: `${cert.certificateId}.pdf` });
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

// @route   POST /api/certificates/bulk-toggle
// @desc    Bulk toggle status (Active/Revoked) for certificates
// @access  Private (Admin & Staff)
router.post('/bulk-toggle', requireAuth, requireRole(['Admin']), async (req, res) => {
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
router.post('/bulk-delete', requireAuth, requireRole(['Admin']), async (req, res) => {
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
router.get('/my', requireAuth, async (req, res) => {
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
router.get('/', requireAuth, async (req, res) => {
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
router.put('/:id', requireAuth, async (req, res) => {
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
router.delete('/:id', requireAuth, async (req, res) => {
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
   4. PUBLIC CERTIFICATE VERIFICATION
   ========================================== */

// @route   GET /api/certificates/verify/:certificateId
// @desc    Public verification of a certificate
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
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

    if (!cert) {
      return res.status(404).json({ verified: false, error: 'Invalid Certificate ID: No matching certificate found' });
    }

    const studentName = cert.userId?.name || cert.studentId?.name || 'N/A';
    const registrationNo = cert.studentId?.registrationNo || cert.userId?.username || cert.certificateId;

    res.json({
      verified: true,
      certificateId: cert.certificateId,
      studentName,
      registrationNo,
      courseName: cert.courseDetailId.technologyId ? cert.courseDetailId.technologyId.name : 'N/A',
      duration: cert.courseDetailId.durationId ? `${cert.courseDetailId.durationId.value} ${cert.courseDetailId.durationId.unit}(s)` : 'N/A',
      issueDate: cert.issueDate,
      status: cert.status,
      pdfUrl: cert.status === 'Active' ? cert.pdfUrl : ''
    });
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

module.exports = router;
