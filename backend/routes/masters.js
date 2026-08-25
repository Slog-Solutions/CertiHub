const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth, requireRole } = require('../middleware/auth');

// Models
const Technology = require('../models/Technology');
const Duration = require('../models/Duration');
const Branch = require('../models/Branch');
const College = require('../models/College');
const CourseDetail = require('../models/CourseDetail');
const Student = require('../models/Student');
const GeneratedCourseLink = require('../models/GeneratedCourseLink');
const Mentor = require('../models/Mentor');
const { uploadBuffer } = require('../utils/cloudinary');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/colleges');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const mentorUploadDir = path.join(__dirname, '../uploads/mentors');
if (!fs.existsSync(mentorUploadDir)) {
  fs.mkdirSync(mentorUploadDir, { recursive: true });
}

// Multer memory storage and validation
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp, gif) are allowed!'));
  }
});

// Helper for pagination & search
const getPaginatedResults = async (model, query, searchFields, page, limit, populateFields = []) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Search logic
  let filter = {};
  if (query.search && searchFields.length > 0) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = searchFields.map(field => ({ [field]: searchRegex }));
  }

  // Handle active state filter
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }

  let dbQuery = model.find(filter);
  populateFields.forEach(p => {
    dbQuery = dbQuery.populate(p);
  });

  const total = await model.countDocuments(filter);
  const data = await dbQuery.sort({ createdAt: -1 }).skip(skip).limit(limitNum);

  return {
    data,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum)
  };
};

/* ==========================================
   1. TECHNOLOGY MASTER
   ========================================== */
router.get('/technology', requireAuth, async (req, res) => {
  try {
    const results = await getPaginatedResults(Technology, req.query, ['name', 'note'], req.query.page, req.query.limit);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/technology', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, note, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const exists = await Technology.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Technology already exists' });

    const tech = new Technology({ name, note, isActive });
    await tech.save();
    res.status(201).json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/technology/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, note, isActive } = req.body;
  try {
    const tech = await Technology.findById(req.params.id);
    if (!tech) return res.status(404).json({ error: 'Technology not found' });

    if (name && name !== tech.name) {
      const exists = await Technology.findOne({ name });
      if (exists) return res.status(400).json({ error: 'Technology name already in use' });
      tech.name = name;
    }

    if (note !== undefined) tech.note = note;
    if (isActive !== undefined) tech.isActive = isActive;

    await tech.save();
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/technology/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const techId = req.params.id;
    // Find all CourseDetail IDs referencing this technology
    const courseDetails = await CourseDetail.find({ technologyId: techId });
    const courseDetailIds = courseDetails.map(c => c._id);

    // Check if any Student is registered under these CourseDetails
    const studentExists = await Student.findOne({ courseDetailId: { $in: courseDetailIds } });
    if (studentExists) {
      return res.status(400).json({ error: 'Cannot delete: Technology is in use by active registrations' });
    }

    // Cascade delete: course details and course links
    await CourseDetail.deleteMany({ technologyId: techId });
    await GeneratedCourseLink.deleteMany({ courseDetailId: { $in: courseDetailIds } });
    await Technology.findByIdAndDelete(techId);

    res.json({ message: 'Technology and dependent courses deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   2. DURATION MASTER
   ========================================== */
router.get('/duration', requireAuth, async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (req.query.search) {
      const searchValue = parseInt(req.query.search);
      if (!isNaN(searchValue)) {
        filter.value = searchValue;
      } else {
        filter.unit = new RegExp(req.query.search, 'i');
      }
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const total = await Duration.countDocuments(filter);
    const data = await Duration.find(filter).sort({ value: 1 }).skip(skip).limit(limitNum);

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/duration', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { value, unit, note, isActive } = req.body;
  if (!value || !unit) return res.status(400).json({ error: 'Value and Unit are required' });

  try {
    const exists = await Duration.findOne({ value, unit });
    if (exists) return res.status(400).json({ error: 'Duration already exists' });

    const dur = new Duration({ value, unit, note, isActive });
    await dur.save();
    res.status(201).json(dur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/duration/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { value, unit, note, isActive } = req.body;
  try {
    const dur = await Duration.findById(req.params.id);
    if (!dur) return res.status(404).json({ error: 'Duration not found' });

    const newValue = value !== undefined ? value : dur.value;
    const newUnit = unit !== undefined ? unit : dur.unit;

    if (newValue !== dur.value || newUnit !== dur.unit) {
      const exists = await Duration.findOne({ value: newValue, unit: newUnit });
      if (exists) return res.status(400).json({ error: 'Duration already exists' });
      dur.value = newValue;
      dur.unit = newUnit;
    }

    if (note !== undefined) dur.note = note;
    if (isActive !== undefined) dur.isActive = isActive;

    await dur.save();
    res.json(dur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/duration/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const durId = req.params.id;
    const courseDetails = await CourseDetail.find({ durationId: durId });
    const courseDetailIds = courseDetails.map(c => c._id);

    const studentExists = await Student.findOne({ durationId: durId });
    if (studentExists) {
      return res.status(400).json({ error: 'Cannot delete: Duration is in use by active registrations' });
    }

    await CourseDetail.deleteMany({ durationId: durId });
    await GeneratedCourseLink.deleteMany({ courseDetailId: { $in: courseDetailIds } });
    await Duration.findByIdAndDelete(durId);

    res.json({ message: 'Duration and dependent courses deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   3. BRANCH MASTER
   ========================================== */

// @route   GET /api/masters/branch/public
// @desc    Minimal public list of active branches (id + name only) for the
//          unauthenticated public registration form's dropdown.
// @access  Public
router.get('/branch/public', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).select('name').sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/masters/technology/public
// @desc    Get active technologies for public view
// @access  Public
router.get('/technology/public', async (req, res) => {
  try {
    const technologies = await Technology.find({ isActive: true }).select('name note').sort({ name: 1 });
    res.json(technologies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/masters/coursedetail/public
// @desc    Get active course details for public view
// @access  Public
router.get('/coursedetail/public', async (req, res) => {
  try {
    const courses = await CourseDetail.find({ isActive: true })
      .populate({
        path: 'technologyId',
        match: { isActive: true },
        select: 'name note'
      })
      .populate({
        path: 'durationId',
        match: { isActive: true },
        select: 'value unit'
      });
    const activeCourses = courses.filter(c => c.technologyId && c.durationId);
    res.json(activeCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/masters/college/public
// @desc    Get active colleges/locations for public view
// @access  Public
router.get('/college/public', async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).select('collegeName shortForm cityName logoImageUrl').sort({ collegeName: 1 });
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/branch', requireAuth, async (req, res) => {
  try {
    const results = await getPaginatedResults(Branch, req.query, ['name', 'note'], req.query.page, req.query.limit);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/branch', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, note, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'Branch name is required' });

  try {
    const exists = await Branch.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Branch already exists' });

    const br = new Branch({ name, note, isActive });
    await br.save();
    res.status(201).json(br);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/branch/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, note, isActive } = req.body;
  try {
    const br = await Branch.findById(req.params.id);
    if (!br) return res.status(404).json({ error: 'Branch not found' });

    if (name && name !== br.name) {
      const exists = await Branch.findOne({ name });
      if (exists) return res.status(400).json({ error: 'Branch name already in use' });
      br.name = name;
    }

    if (note !== undefined) br.note = note;
    if (isActive !== undefined) br.isActive = isActive;

    await br.save();
    res.json(br);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/branch/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const branchId = req.params.id;
    const studentExists = await Student.findOne({ branchId });
    if (studentExists) {
      return res.status(400).json({ error: 'Cannot delete: Branch is in use by active registrations' });
    }

    await Branch.findByIdAndDelete(branchId);
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   4. COLLEGE MASTER (With image logo upload)
   ========================================== */
router.get('/college', requireAuth, async (req, res) => {
  try {
    const results = await getPaginatedResults(College, req.query, ['cityName', 'collegeName', 'shortForm'], req.query.page, req.query.limit);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/college', requireAuth, requireRole(['Admin']), upload.single('logoImage'), async (req, res) => {
  const { cityName, collegeName, shortForm, isActive, showSignature } = req.body;
  if (!cityName || !collegeName || !shortForm) {
    return res.status(400).json({ error: 'City, College Name, and Short Form are required' });
  }

  try {
    let logoImageUrl = '';
    if (req.file) {
      const filename = `logo-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      logoImageUrl = `/uploads/colleges/${filename}`;
    }

    const college = new College({
      cityName,
      collegeName,
      shortForm,
      logoImageUrl,
      isActive: isActive === 'true' || isActive === true,
      showSignature: showSignature === 'true' || showSignature === true
    });

    await college.save();
    res.status(201).json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/college/:id', requireAuth, requireRole(['Admin']), upload.single('logoImage'), async (req, res) => {
  const { cityName, collegeName, shortForm, isActive, showSignature } = req.body;
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    if (cityName) college.cityName = cityName;
    if (collegeName) college.collegeName = collegeName;
    if (shortForm) college.shortForm = shortForm;
    if (isActive !== undefined) college.isActive = isActive === 'true' || isActive === true;
    if (showSignature !== undefined) college.showSignature = showSignature === 'true' || showSignature === true;

    if (req.file) {
      // Remove old logo if it exists
      if (college.logoImageUrl) {
        const oldPath = path.join(__dirname, '..', college.logoImageUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error('Failed to delete old logo file:', e.message); }
        }
      }

      const filename = `logo-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      college.logoImageUrl = `/uploads/colleges/${filename}`;
    }

    await college.save();
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/college/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const collegeId = req.params.id;
    const studentExists = await Student.findOne({ collegeId });
    if (studentExists) {
      return res.status(400).json({ error: 'Cannot delete: College is in use by active registrations' });
    }

    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: 'College not found' });

    // Clean up files
    if (college.logoImageUrl) {
      const logoPath = path.join(__dirname, '..', college.logoImageUrl);
      if (fs.existsSync(logoPath)) {
        try { fs.unlinkSync(logoPath); } catch (e) { console.error(e); }
      }
    }

    await GeneratedCourseLink.deleteMany({ collegeId });
    await College.findByIdAndDelete(collegeId);

    res.json({ message: 'College and its dependencies deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   5. COURSE DETAILS MASTER
   ========================================== */
router.get('/coursedetail', requireAuth, async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // We need to fetch and populate first to do filter/search by technology name
    // A robust query logic:
    let filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.isActive === 'true') {
      const activeTechs = await Technology.find({ isActive: true }).select('_id');
      const activeTechIds = activeTechs.map(t => t._id);
      filter.technologyId = { $in: activeTechIds };

      const activeDurs = await Duration.find({ isActive: true }).select('_id');
      const activeDurIds = activeDurs.map(d => d._id);
      filter.durationId = { $in: activeDurIds };
    }

    if (req.query.search) {
      // Find matching technology ids
      const techs = await Technology.find({ name: new RegExp(req.query.search, 'i') });
      const searchTechIds = techs.map(t => t._id);
      
      const searchOr = [
        { technologyId: { $in: searchTechIds } }
      ];
      const priceVal = parseFloat(req.query.search);
      if (!isNaN(priceVal)) {
        searchOr.push({ price: priceVal });
      }

      if (filter.technologyId || filter.durationId) {
        const conditions = [];
        if (filter.technologyId) conditions.push({ technologyId: filter.technologyId });
        if (filter.durationId) conditions.push({ durationId: filter.durationId });
        conditions.push({ $or: searchOr });
        
        filter.$and = conditions;
        delete filter.technologyId;
        delete filter.durationId;
      } else {
        filter.$or = searchOr;
      }
    }

    const total = await CourseDetail.countDocuments(filter);
    const data = await CourseDetail.find(filter)
      .populate('technologyId')
      .populate('durationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coursedetail', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { technologyId, durationId, price, isActive } = req.body;
  if (!technologyId || !durationId || price === undefined) {
    return res.status(400).json({ error: 'Technology, Duration, and Price are required' });
  }

  try {
    const exists = await CourseDetail.findOne({ technologyId, durationId });
    if (exists) return res.status(400).json({ error: 'Course Detail with this Technology & Duration already exists' });

    const cd = new CourseDetail({ technologyId, durationId, price, isActive });
    await cd.save();
    
    // Return populated object
    const populated = await CourseDetail.findById(cd._id).populate('technologyId').populate('durationId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/coursedetail/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { technologyId, durationId, price, isActive } = req.body;
  try {
    const cd = await CourseDetail.findById(req.params.id);
    if (!cd) return res.status(404).json({ error: 'Course Detail not found' });

    const newTech = technologyId || cd.technologyId;
    const newDur = durationId || cd.durationId;

    if (newTech.toString() !== cd.technologyId.toString() || newDur.toString() !== cd.durationId.toString()) {
      const exists = await CourseDetail.findOne({ technologyId: newTech, durationId: newDur });
      if (exists) return res.status(400).json({ error: 'Course Detail with this Technology & Duration already exists' });
      cd.technologyId = newTech;
      cd.durationId = newDur;
    }

    if (price !== undefined) cd.price = price;
    if (isActive !== undefined) cd.isActive = isActive;

    await cd.save();
    
    const populated = await CourseDetail.findById(cd._id).populate('technologyId').populate('durationId');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/coursedetail/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const courseDetailId = req.params.id;
    const studentExists = await Student.findOne({ courseDetailId });
    if (studentExists) {
      return res.status(400).json({ error: 'Cannot delete: Course Detail is in use by active student registrations' });
    }

    await GeneratedCourseLink.deleteMany({ courseDetailId });
    await CourseDetail.findByIdAndDelete(courseDetailId);
    res.json({ message: 'Course Detail deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   6. MENTOR MASTER
   ========================================== */
router.get('/mentor', requireAuth, async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 500;
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { designation: searchRegex }];
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const total = await Mentor.countDocuments(filter);
    const data = await Mentor.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mentor', requireAuth, requireRole(['Admin']), upload.single('photo'), async (req, res) => {
  const { name, designation, image, sortOrder, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'Mentor name is required' });

  try {
    let finalImageUrl = image || '';

    if (req.file) {
      try {
        const cloudRes = await uploadBuffer(req.file.buffer, 'media/mentors');
        finalImageUrl = cloudRes.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload fallback to local storage:', cloudErr.message);
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = `mentor_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(mentorUploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        finalImageUrl = `/uploads/mentors/${filename}`;
      }
    }

    const mentor = new Mentor({
      name,
      designation: designation || '',
      image: finalImageUrl,
      sortOrder: parseInt(sortOrder) || 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
    });
    await mentor.save();
    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/mentor/bulk-sort', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: parseInt(item.sortOrder) || 0 } }
      }
    }));

    if (bulkOps.length > 0) {
      await Mentor.bulkWrite(bulkOps);
    }

    res.json({ message: 'Sort orders updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/mentor/:id', requireAuth, requireRole(['Admin']), upload.single('photo'), async (req, res) => {
  const { name, designation, image, sortOrder, isActive } = req.body;
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    if (name !== undefined) mentor.name = name;
    if (designation !== undefined) mentor.designation = designation;
    if (sortOrder !== undefined) mentor.sortOrder = parseInt(sortOrder) || 0;
    if (isActive !== undefined) mentor.isActive = (isActive === 'true' || isActive === true);

    if (req.file) {
      try {
        const cloudRes = await uploadBuffer(req.file.buffer, 'media/mentors');
        mentor.image = cloudRes.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload fallback to local storage:', cloudErr.message);
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = `mentor_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(mentorUploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        mentor.image = `/uploads/mentors/${filename}`;
      }
    } else if (image !== undefined) {
      mentor.image = image;
    }

    await mentor.save();
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/mentor/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    await Mentor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mentor record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
