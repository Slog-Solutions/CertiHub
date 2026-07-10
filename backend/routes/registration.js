const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const GeneratedCourseLink = require('../models/GeneratedCourseLink');
const College = require('../models/College');
const CourseDetail = require('../models/CourseDetail');
const FeePayment = require('../models/FeePayment');
const FeeDiscount = require('../models/FeeDiscount');
const Certificate = require('../models/Certificate');
const Branch = require('../models/Branch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildSearchRegex } = require('../utils/regexSafe');

// Photo Upload Configuration
const photoDir = path.join(__dirname, '../uploads/photos');
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only photos (jpg, jpeg, png, webp) are allowed!'));
  }
});

const uploadExcel = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed!'));
  }
});

// Helper: Registration Number Generator
// Format: STP-YYYY-MM-DD-<5 random chars uppercase>
const generateRegistrationNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `STP-${year}-${month}-${day}-${randomChars}`;
};

/* ==========================================
   1. STUDENT REGISTRATION
   ========================================== */

// @route   GET /api/registration/students
// @desc    Get all students (with search, filter, pagination)
// @access  Private (Admin & Staff)
router.get('/students', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = buildSearchRegex(req.query.search);
    filter.$or = [
      { name: searchRegex },
      { registrationNo: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { location: searchRegex }
    ];
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  try {
    const total = await Student.countDocuments(filter);
    let dbQuery = Student.find(filter)
      .populate('collegeId')
      .populate('branchId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    if (req.query.all !== 'true') {
      dbQuery = dbQuery.skip(skip).limit(limit);
    }

    const students = await dbQuery;

    res.json({
      data: students,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/register
// @desc    Register a new student (Admin-side, requires login) OR Public (requires a
//          valid active linkId). Exactly one of those two paths must be satisfied —
//          this endpoint never accepts arbitrary unauthenticated, link-less submissions.
// @access  Public (link-based) or Private (session-based)
router.post('/register', upload.single('photo'), async (req, res) => {
  const { linkId } = req.body;
  let link = null;

  if (linkId) {
    // Public flow: the link is the source of truth for college/course/duration/location/price.
    link = await GeneratedCourseLink.findById(linkId)
      .populate('collegeId')
      .populate({ path: 'courseDetailId', populate: [{ path: 'technologyId' }, { path: 'durationId' }] })
      .catch(() => null);

    if (!link || !link.isActive || 
        !link.collegeId || !link.collegeId.isActive || 
        !link.courseDetailId || !link.courseDetailId.isActive || 
        !link.courseDetailId.technologyId || !link.courseDetailId.technologyId.isActive || 
        !link.courseDetailId.durationId || !link.courseDetailId.durationId.isActive) {
      return res.status(400).json({ error: 'Registration link is inactive or invalid' });
    }
  } else {
    // No link supplied: this must be an authenticated admin/staff dashboard submission.
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required to register a student without a course link' });
    }
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  }

  const {
    name, fatherName, dob, gender, email, phone, nationality, address,
    workingStatus, branchId, year, state, city,
    trainingType, startDate, feeChoice
  } = req.body;

  // Fields that must be trusted from the server (link) when a link is used, and from the
  // authenticated caller otherwise — never taken at face value from an unauthenticated body.
  let collegeId, courseDetailId, durationId, location, totalFee, amountSubmitted, paymentType;

  if (link) {
    collegeId = link.collegeId?._id;
    courseDetailId = link.courseDetailId?._id;
    durationId = link.courseDetailId?.durationId?._id || link.courseDetailId?.durationId;
    location = link.location;
    if (feeChoice === 'free') {
      totalFee = 0;
      amountSubmitted = 0;
    } else {
      totalFee = link.price;
      amountSubmitted = feeChoice === 'full' ? totalFee : Math.min(1000, totalFee);
    }
    paymentType = 'online';
  } else {
    collegeId = req.body.collegeId;
    courseDetailId = req.body.courseDetailId;
    durationId = req.body.durationId;
    location = req.body.location || '';
    totalFee = parseFloat(req.body.totalFee);
    amountSubmitted = parseFloat(req.body.amountSubmitted) || 0;
    paymentType = req.body.paymentType || 'offline';
  }

  // Validation
  if (!name || !fatherName || !dob || !gender || !email || !phone || !address ||
      !collegeId || !branchId || !courseDetailId || !durationId || !startDate ||
      totalFee === undefined || isNaN(totalFee)) {
    return res.status(400).json({ error: 'Please fill in all required candidate registration fields' });
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  try {
    // Generate Registration No
    const registrationNo = generateRegistrationNumber();

    // Process photo if uploaded
    let photoUrl = '';
    if (req.file) {
      const filename = `photo-${Date.now()}${path.extname(req.file.originalname)}`;
      fs.writeFileSync(path.join(photoDir, filename), req.file.buffer);
      photoUrl = `/uploads/photos/${filename}`;
    }

    const student = new Student({
      registrationNo,
      name,
      fatherName,
      dob: new Date(dob),
      gender,
      email,
      phone,
      nationality: nationality || 'Indian',
      address,
      photoUrl,
      workingStatus: workingStatus || 'student',
      collegeId,
      branchId,
      year: year || '',
      state: state || '',
      city: city || '',
      trainingType: trainingType || '',
      courseDetailId,
      durationId,
      startDate: new Date(startDate),
      location: location || '',
      totalFee,
      isActive: true
    });

    await student.save();

    // Initialize Fee Discount
    const feeDiscount = new FeeDiscount({
      studentId: student._id,
      totalFee,
      discountAmount: 0,
      totalToPay: totalFee
    });
    await feeDiscount.save();

    // Add initial payment if submitted
    if (amountSubmitted > 0) {
      const payment = new FeePayment({
        studentId: student._id,
        amount: amountSubmitted,
        paymentType,
        paidOn: new Date()
      });
      await payment.save();
    }

    res.status(201).json({
      message: 'Student registered successfully',
      registrationNo: student.registrationNo,
      student
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/registration/students/:id
// @desc    Update student details
// @access  Private (Admin & Staff)
router.put('/students/:id', requireAuth, upload.single('photo'), async (req, res) => {
  const {
    name, fatherName, dob, gender, email, phone, nationality, address,
    workingStatus, collegeId, branchId, year, state, city,
    trainingType, courseDetailId, durationId, startDate, location,
    totalFee, isActive
  } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Process photo update
    if (req.file) {
      if (student.photoUrl) {
        const oldPath = path.join(__dirname, '..', student.photoUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error('Photo delete error:', e.message); }
        }
      }
      const filename = `photo-${Date.now()}${path.extname(req.file.originalname)}`;
      fs.writeFileSync(path.join(photoDir, filename), req.file.buffer);
      student.photoUrl = `/uploads/photos/${filename}`;
    }

    if (name) student.name = name;
    if (fatherName) student.fatherName = fatherName;
    if (dob) student.dob = new Date(dob);
    if (gender) student.gender = gender;
    if (email) student.email = email;
    if (phone) {
      if (!/^\d{10}$/.test(phone.trim())) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
      }
      student.phone = phone.trim();
    }
    if (nationality) student.nationality = nationality;
    if (address) student.address = address;
    if (workingStatus) student.workingStatus = workingStatus;
    if (collegeId) student.collegeId = collegeId;
    if (branchId) student.branchId = branchId;
    if (year !== undefined) student.year = year;
    if (state !== undefined) student.state = state;
    if (city !== undefined) student.city = city;
    if (trainingType !== undefined) student.trainingType = trainingType;
    if (courseDetailId) student.courseDetailId = courseDetailId;
    if (durationId) student.durationId = durationId;
    if (startDate) student.startDate = new Date(startDate);
    if (location !== undefined) student.location = location;
    if (isActive !== undefined) student.isActive = isActive === 'true' || isActive === true;

    if (totalFee !== undefined) {
      const oldTotal = student.totalFee;
      student.totalFee = parseFloat(totalFee);
      // Synchronize with Fee Discount record if totalFee changed
      if (oldTotal !== student.totalFee) {
        const discountRec = await FeeDiscount.findOne({ studentId: student._id });
        if (discountRec) {
          discountRec.totalFee = student.totalFee;
          discountRec.totalToPay = student.totalFee - discountRec.discountAmount;
          await discountRec.save();
        }
      }
    }

    await student.save();
    
    const populated = await Student.findById(student._id)
      .populate('collegeId')
      .populate('branchId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/registration/students/:id
// @desc    Delete student and clean up dependent payments, discounts, certificates
// @access  Private (Admin & Staff)
router.delete('/students/:id', requireAuth, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete photo if exists
    if (student.photoUrl) {
      const photoPath = path.join(__dirname, '..', student.photoUrl);
      if (fs.existsSync(photoPath)) {
        try { fs.unlinkSync(photoPath); } catch (e) { console.error(e); }
      }
    }

    // Clean up dependent records
    await FeePayment.deleteMany({ studentId });
    await FeeDiscount.deleteMany({ studentId });

    // Retrieve and clean up certificates PDFs
    const certs = await Certificate.find({ studentId });
    for (const cert of certs) {
      if (cert.pdfUrl) {
        const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
        if (fs.existsSync(pdfPath)) {
          try { fs.unlinkSync(pdfPath); } catch (e) { console.error(e); }
        }
      }
      if (cert.qrCodeUrl && cert.qrCodeUrl.startsWith('/uploads/')) {
        const qrPath = path.join(__dirname, '..', cert.qrCodeUrl);
        if (fs.existsSync(qrPath)) {
          try { fs.unlinkSync(qrPath); } catch (e) { console.error(e); }
        }
      }
    }
    await Certificate.deleteMany({ studentId });

    // Delete student
    await Student.findByIdAndDelete(studentId);

    res.json({ message: 'Student and all associated payments, discounts, and certificates deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/students/bulk-toggle
// @desc    Bulk toggle student active status
// @access  Private (Admin & Staff)
router.post('/students/bulk-toggle', requireAuth, async (req, res) => {
  const { ids, isActive } = req.body;
  if (!ids || !Array.isArray(ids) || isActive === undefined) {
    return res.status(400).json({ error: 'Missing ids array or target isActive value' });
  }

  try {
    await Student.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: isActive === 'true' || isActive === true } }
    );
    res.json({ message: 'Students status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/students/bulk-delete
// @desc    Delete multiple students and associated records (payments, discounts, certificates, files)
// @access  Private (Admin & Staff)
router.post('/students/bulk-delete', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No student records selected for deletion' });
  }

  try {
    // Delete dependent fee payments & discounts
    await FeePayment.deleteMany({ studentId: { $in: ids } });
    await FeeDiscount.deleteMany({ studentId: { $in: ids } });

    // Retrieve and clean up certificates PDFs/QRs
    const certs = await Certificate.find({ studentId: { $in: ids } });
    for (const cert of certs) {
      if (cert.pdfUrl) {
        const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
        if (fs.existsSync(pdfPath)) {
          try { fs.unlinkSync(pdfPath); } catch (e) { console.error(e); }
        }
      }
      if (cert.qrCodeUrl && cert.qrCodeUrl.startsWith('/uploads/')) {
        const qrPath = path.join(__dirname, '..', cert.qrCodeUrl);
        if (fs.existsSync(qrPath)) {
          try { fs.unlinkSync(qrPath); } catch (e) { console.error(e); }
        }
      }
    }
    await Certificate.deleteMany({ studentId: { $in: ids } });

    // Delete photo files
    const students = await Student.find({ _id: { $in: ids } });
    for (const student of students) {
      if (student.photoUrl) {
        const photoPath = path.join(__dirname, '..', student.photoUrl);
        if (fs.existsSync(photoPath)) {
          try { fs.unlinkSync(photoPath); } catch (e) { console.error(e); }
        }
      }
    }

    // Delete students
    await Student.deleteMany({ _id: { $in: ids } });

    res.json({ message: 'Selected student records and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/students/toggle-all
// @desc    Toggle status for all students matching current filters (search, active status)
// @access  Private (Admin & Staff)
router.post('/students/toggle-all', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { search, isActive } = req.body;

  let filter = {};
  if (search) {
    const searchRegex = buildSearchRegex(search);
    filter.$or = [
      { name: searchRegex },
      { registrationNo: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { location: searchRegex }
    ];
  }

  try {
    await Student.updateMany(
      filter,
      { $set: { isActive: isActive === 'true' || isActive === true } }
    );
    res.json({ message: 'All matching students status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/students/delete-all
// @desc    Delete ALL students matching current filters (search, active status)
// @access  Private (Admin & Staff)
router.post('/students/delete-all', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { search, isActive } = req.body;

  let filter = {};
  if (search) {
    const searchRegex = buildSearchRegex(search);
    filter.$or = [
      { name: searchRegex },
      { registrationNo: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { location: searchRegex }
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  try {
    // Find all matching students
    const students = await Student.find(filter, '_id photoUrl');
    const ids = students.map(s => s._id);

    if (ids.length === 0) {
      return res.json({ message: 'No student records matched the current filter. Zero records deleted.' });
    }

    // Delete dependent fee payments & discounts
    await FeePayment.deleteMany({ studentId: { $in: ids } });
    await FeeDiscount.deleteMany({ studentId: { $in: ids } });

    // Retrieve and clean up certificates PDFs/QRs
    const certs = await Certificate.find({ studentId: { $in: ids } });
    for (const cert of certs) {
      if (cert.pdfUrl) {
        const pdfPath = path.join(__dirname, '..', cert.pdfUrl);
        if (fs.existsSync(pdfPath)) {
          try { fs.unlinkSync(pdfPath); } catch (e) { console.error(e); }
        }
      }
      if (cert.qrCodeUrl && cert.qrCodeUrl.startsWith('/uploads/')) {
        const qrPath = path.join(__dirname, '..', cert.qrCodeUrl);
        if (fs.existsSync(qrPath)) {
          try { fs.unlinkSync(qrPath); } catch (e) { console.error(e); }
        }
      }
    }
    await Certificate.deleteMany({ studentId: { $in: ids } });

    // Delete photo files
    for (const student of students) {
      if (student.photoUrl) {
        const photoPath = path.join(__dirname, '..', student.photoUrl);
        if (fs.existsSync(photoPath)) {
          try { fs.unlinkSync(photoPath); } catch (e) { console.error(e); }
        }
      }
    }

    // Delete students
    await Student.deleteMany({ _id: { $in: ids } });

    res.json({ message: `Successfully deleted all ${ids.length} student records matching the current criteria.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ==========================================
   2. GENERATE COURSE LINKS
   ========================================== */

// @route   GET /api/registration/links
// @desc    Get all course links
// @access  Private (Admin & Staff)
router.get('/links', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  try {
    const total = await GeneratedCourseLink.countDocuments(filter);
    const links = await GeneratedCourseLink.find(filter)
      .populate('collegeId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: links,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/registration/links/public/:id
// @desc    Get course link details by ID (no auth required, for public pre-fill)
// @access  Public
router.get('/links/public/:id', async (req, res) => {
  try {
    const link = await GeneratedCourseLink.findById(req.params.id)
      .populate('collegeId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    if (!link || !link.isActive || 
        !link.collegeId || !link.collegeId.isActive || 
        !link.courseDetailId || !link.courseDetailId.isActive || 
        !link.courseDetailId.technologyId || !link.courseDetailId.technologyId.isActive || 
        !link.courseDetailId.durationId || !link.courseDetailId.durationId.isActive) {
      return res.status(404).json({ error: 'Registration link is inactive or invalid' });
    }

    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Invalid link code' });
  }
});

// @route   POST /api/registration/links
// @desc    Create a shareable course link
// @access  Private (Admin & Staff)
router.post('/links', requireAuth, async (req, res) => {
  const { courseDetailId, collegeId, price, location, isActive } = req.body;

  if (!courseDetailId || !collegeId || price === undefined || !location) {
    return res.status(400).json({ error: 'Course, College, Price, and Location are required' });
  }

  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    const link = new GeneratedCourseLink({
      courseDetailId,
      collegeId,
      price: parseFloat(price),
      location,
      generatedUrl: '', // Will assign below
      isActive: isActive !== undefined ? isActive : true
    });

    // Assign the public URL referencing our React frontend route
    link.generatedUrl = `${clientUrl}/register?linkId=${link._id}`;
    await link.save();

    const populated = await GeneratedCourseLink.findById(link._id)
      .populate('collegeId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/links/bulk-toggle
// @desc    Toggle status of multiple course links using checkbox IDs
// @access  Private (Admin & Staff)
router.post('/links/bulk-toggle', requireAuth, async (req, res) => {
  const { ids, isActive } = req.body;

  if (!ids || !Array.isArray(ids) || isActive === undefined) {
    return res.status(400).json({ error: 'Missing ids array or target isActive value' });
  }

  try {
    await GeneratedCourseLink.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: isActive === 'true' || isActive === true } }
    );
    res.json({ message: 'Links updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/registration/links/:id
// @desc    Update course link configurations
// @access  Private (Admin & Staff)
router.put('/links/:id', requireAuth, async (req, res) => {
  const { courseDetailId, collegeId, price, location, isActive } = req.body;

  try {
    const link = await GeneratedCourseLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Course link not found' });
    }

    if (courseDetailId) link.courseDetailId = courseDetailId;
    if (collegeId) link.collegeId = collegeId;
    if (price !== undefined) link.price = parseFloat(price);
    if (location) link.location = location;
    if (isActive !== undefined) link.isActive = isActive === 'true' || isActive === true;

    await link.save();

    const populated = await GeneratedCourseLink.findById(link._id)
      .populate('collegeId')
      .populate({
        path: 'courseDetailId',
        populate: [{ path: 'technologyId' }, { path: 'durationId' }]
      });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/registration/links/:id
// @desc    Delete course link configurations
// @access  Private (Admin & Staff)
router.delete('/links/:id', requireAuth, async (req, res) => {
  try {
    const link = await GeneratedCourseLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Course link not found' });
    }
    await GeneratedCourseLink.deleteOne({ _id: req.params.id });
    res.json({ message: 'Course link deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/registration/bulk-upload
// @desc    Register students in bulk via Excel sheet
// @access  Private (Admin & Staff)
router.post('/bulk-upload', requireAuth, uploadExcel.single('excelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please choose a valid Excel spreadsheet to upload.' });
  }

  const { collegeId, courseDetailId, startDate, location } = req.body;

  if (!collegeId || !courseDetailId || !startDate) {
    return res.status(400).json({ error: 'Please select College, Course, and Start Date.' });
  }

  try {
    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ error: 'The uploaded Excel file contains no data rows.' });
    }

    // Resolve incoming keys by mapping names and synonyms case-insensitively
    const resolveKey = (k) => {
      const raw = String(k || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (['fullname', 'name', 'studentname', 'student'].includes(raw)) return 'fullname';
      if (['dateofbirth', 'dob', 'doa', 'birthdate', 'birth'].includes(raw)) return 'dateofbirth';
      if (['gender', 'sex'].includes(raw)) return 'gender';
      if (['email', 'emailaddress'].includes(raw)) return 'email';
      if (['phonenumber', 'phone', 'mobile', 'mobilenumber', 'contact'].includes(raw)) return 'phonenumber';
      if (['permanentaddress', 'address'].includes(raw)) return 'permanentaddress';
      if (['workingstatus', 'status'].includes(raw)) return 'workingstatus';
      if (['branchdepartment', 'branch', 'department'].includes(raw)) return 'branchdepartment';
      if (['yearofstudy', 'year', 'class', 'semester'].includes(raw)) return 'yearofstudy';
      if (['trainingterm', 'term', 'training'].includes(raw)) return 'trainingterm';
      if (['paymentterm', 'payment'].includes(raw)) return 'paymentterm';
      return raw;
    };

    const requiredHeaders = [
      { key: 'fullname', original: 'FullName' },
      { key: 'dateofbirth', original: 'DateOfBirth' },
      { key: 'gender', original: 'Gender' },
      { key: 'email', original: 'Email' },
      { key: 'phonenumber', original: 'PhoneNumber' },
      { key: 'permanentaddress', original: 'PermanentAddress' },
      { key: 'workingstatus', original: 'WorkingStatus' },
      { key: 'branchdepartment', original: 'Branch/Department' },
      { key: 'yearofstudy', original: 'YearOfStudy' },
      { key: 'trainingterm', original: 'TrainingTerm' },
      { key: 'paymentterm', original: 'PaymentTerm' }
    ];

    const firstRowKeys = Object.keys(sheetData[0]).map(resolveKey);
    const missingHeaders = requiredHeaders
      .filter(rh => !firstRowKeys.includes(rh.key))
      .map(rh => rh.original);

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: `Excel upload rejected. The sheet is missing the following required columns: ${missingHeaders.join(', ')}`
      });
    }

    // Look up course detail
    const courseDetail = await CourseDetail.findById(courseDetailId)
      .populate('technologyId')
      .populate('durationId');
    if (!courseDetail) {
      return res.status(400).json({ error: 'Selected course detail not found.' });
    }

    const durationId = courseDetail.durationId?._id || courseDetail.durationId;
    const price = courseDetail.price || 0;

    const successList = [];
    const failures = [];

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      const rowNum = i + 2;

      // Map row keys for safe, robust, case-insensitive extraction using resolveKey
      const normRow = {};
      Object.keys(row).forEach(k => {
        normRow[resolveKey(k)] = row[k];
      });

      const name = String(normRow.fullname || '').trim();
      const dobVal = normRow.dateofbirth;
      const gender = String(normRow.gender || 'Male').trim();
      const email = String(normRow.email || '').trim();
      const phone = String(normRow.phonenumber || '').trim();
      const address = String(normRow.permanentaddress || '').trim();
      const workingStatus = String(normRow.workingstatus || 'student').trim().toLowerCase();
      const branchName = String(normRow.branchdepartment || '').trim();
      const year = String(normRow.yearofstudy || '').trim();
      const trainingType = String(normRow.trainingterm || 'Summer Training').trim();
      const paymentTerm = String(normRow.paymentterm || 'Full').trim().toLowerCase();

      if (!name) {
        failures.push({ row: rowNum, name: 'N/A', reason: 'Missing FullName column value' });
        continue;
      }

      if (!dobVal) {
        failures.push({ row: rowNum, name, reason: 'Missing DateOfBirth' });
        continue;
      }

      // Find or create Branch
      let branchId = null;
      if (branchName) {
        let branch = await Branch.findOne({ name: new RegExp('^' + branchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
        if (!branch) {
          branch = new Branch({ name: branchName, note: 'Created via bulk excel upload' });
          await branch.save();
        }
        branchId = branch._id;
      } else {
        failures.push({ row: rowNum, name, reason: 'Missing Branch/Department' });
        continue;
      }

      try {
        let dob;
        if (typeof dobVal === 'number') {
          // Serial number from Excel (Excel epoch starts 1900-01-01)
          dob = new Date(Math.round((dobVal - 25569) * 86400 * 1000));
        } else {
          dob = new Date(dobVal);
        }

        if (isNaN(dob.getTime())) {
          failures.push({ row: rowNum, name, reason: `Invalid DateOfBirth format: ${dobVal}` });
          continue;
        }

        let totalFee = price;
        let amountSubmitted = 0;

        if (paymentTerm === 'free' || paymentTerm === 'zero' || price === 0) {
          totalFee = 0;
          amountSubmitted = 0;
        } else if (paymentTerm === 'booking' || paymentTerm === 'reservation') {
          amountSubmitted = Math.min(1000, price);
        } else {
          amountSubmitted = price;
        }

        // Check if student with this email or phone is already registered
        const existingStudent = await Student.findOne({ $or: [{ email }, { phone }] });
        if (existingStudent) {
          failures.push({ row: rowNum, name, reason: `Student with email '${email}' or phone '${phone}' is already registered` });
          continue;
        }

        const registrationNo = generateRegistrationNumber();

        const student = new Student({
          registrationNo,
          name,
          fatherName: 'Not Provided',
          dob,
          gender,
          email,
          phone,
          address,
          nationality: 'Indian',
          workingStatus,
          collegeId,
          branchId,
          year,
          state: '',
          city: '',
          trainingType,
          courseDetailId,
          durationId,
          startDate: new Date(startDate),
          location: location || '',
          totalFee,
          isActive: true
        });

        await student.save();

        const feeDiscount = new FeeDiscount({
          studentId: student._id,
          totalFee,
          discountAmount: 0,
          totalToPay: totalFee
        });
        await feeDiscount.save();

        if (amountSubmitted > 0) {
          const payment = new FeePayment({
            studentId: student._id,
            amount: amountSubmitted,
            paymentType: 'offline',
            paidOn: new Date()
          });
          await payment.save();
        }

        successList.push({ name, registrationNo });

      } catch (err) {
        failures.push({ row: rowNum, name, reason: err.message });
      }
    }

    res.json({
      totalRows: sheetData.length,
      successCount: successList.length,
      failureCount: failures.length,
      successList,
      failures
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
