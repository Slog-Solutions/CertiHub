const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CustomCourse = require('../models/CustomCourse');
const CourseCategory = require('../models/CourseCategory');
const { requireAuth, requireRole } = require('../middleware/auth');

// Multer disk storage configuration for Course Images
const uploadsDir = path.join(__dirname, '../uploads/courses');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed!'));
  }
});

/* ==========================================================
   CATEGORY ENDPOINTS
   ========================================================== */

// GET all categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await CourseCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create category (Admin Only)
router.post('/categories', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  try {
    const existing = await CourseCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    const category = new CourseCategory({ name: name.trim() });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category (Admin Only)
router.delete('/categories/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const categoryId = req.params.id;
    // Check if category is in use by any courses
    const inUse = await CustomCourse.findOne({ category: categoryId });
    if (inUse) {
      return res.status(400).json({ error: 'Cannot delete category that has courses assigned to it' });
    }
    const deleted = await CourseCategory.findByIdAndDelete(categoryId);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   COURSE ENDPOINTS
   ========================================================== */

// GET all courses (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const courses = await CustomCourse.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET public courses only (Active, grouped/sorted)
router.get('/public', async (req, res) => {
  try {
    const courses = await CustomCourse.find({ isActive: true })
      .populate('category', 'name')
      .sort({ name: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create course (Admin Only)
router.post('/', requireAuth, requireRole(['Admin']), upload.single('image'), async (req, res) => {
  const { name, description, fees, duration, categoryId, isActive } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ error: 'Course name and category ID are required' });
  }

  try {
    const categoryExists = await CourseCategory.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/courses/${req.file.filename}`;
    }

    const course = new CustomCourse({
      name: name.trim(),
      description: description ? description.trim() : '',
      fees: fees ? fees.trim() : '',
      duration: duration ? duration.trim() : '',
      image: imageUrl,
      category: categoryId,
      isActive: isActive !== 'false'
    });

    await course.save();
    const populated = await course.populate('category', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update course (Admin Only)
router.put('/:id', requireAuth, requireRole(['Admin']), upload.single('image'), async (req, res) => {
  const { name, description, fees, duration, categoryId, isActive } = req.body;

  try {
    const course = await CustomCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (categoryId) {
      const categoryExists = await CourseCategory.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({ error: 'Category not found' });
      }
      course.category = categoryId;
    }

    if (name) course.name = name.trim();
    if (description !== undefined) course.description = description.trim();
    if (fees !== undefined) course.fees = fees.trim();
    if (duration !== undefined) course.duration = duration.trim();
    if (isActive !== undefined) course.isActive = isActive !== 'false';

    if (req.file) {
      // Optional: Delete old image from disk
      if (course.image) {
        const oldPath = path.join(__dirname, '..', course.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      course.image = `/uploads/courses/${req.file.filename}`;
    }

    await course.save();
    const populated = await course.populate('category', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE course (Admin Only)
router.delete('/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const course = await CustomCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete image from disk
    if (course.image) {
      const imgPath = path.join(__dirname, '..', course.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await CustomCourse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
