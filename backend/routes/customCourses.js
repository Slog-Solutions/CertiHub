const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CustomCourse = require('../models/CustomCourse');
const CourseCategory = require('../models/CourseCategory');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadBuffer, cloudinary } = require('../utils/cloudinary');

// Helper to extract Cloudinary public ID
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const pathParts = parts.slice(uploadIndex + 2); // skips 'upload' and version (e.g. 'v12345')
    const pathWithExt = pathParts.join('/');
    const publicId = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
    return publicId;
  } catch (err) {
    console.error('Failed to parse Cloudinary public ID:', err);
    return null;
  }
};

// Helper to delete an old course image (handles both local file and Cloudinary)
const deleteOldImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  if (imageUrl.includes('res.cloudinary.com')) {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Successfully deleted Cloudinary image: ${publicId}`);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
      }
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    const oldPath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
        console.log(`Successfully deleted local image file: ${oldPath}`);
      } catch (err) {
        console.error(`Failed to delete local image: ${oldPath}`, err);
      }
    }
  }
};

// Multer memory storage configuration for Course Images
const storage = multer.memoryStorage();

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
      try {
        const result = await uploadBuffer(req.file.buffer, 'courses');
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary. Please check your CLOUDINARY configuration in backend/.env' });
      }
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
      try {
        const result = await uploadBuffer(req.file.buffer, 'courses');
        if (course.image) {
          await deleteOldImage(course.image);
        }
        course.image = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary. Please check your CLOUDINARY configuration in backend/.env' });
      }
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

    // Delete image from Cloudinary or local disk
    if (course.image) {
      await deleteOldImage(course.image);
    }

    await CustomCourse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
