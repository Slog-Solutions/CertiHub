const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

// Multer memory storage configuration for PDF uploads
const storage = multer.memoryStorage();
const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed!'));
  }
});

// Ensure directory exists utility
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* ==========================================
   ADMIN ROUTES (Requires requireRole(['Admin']))
   ========================================== */

// Get all batches
router.get('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('teacherId', 'name username email')
      .populate('students', 'name username email mobile')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new batch
router.post('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { batchId, name, uniqueKey, teacherId } = req.body;

  if (!batchId || !name || !uniqueKey || !teacherId) {
    return res.status(400).json({ error: 'Please fill all required fields: batchId, name, uniqueKey, teacherId' });
  }

  try {
    // Check if batchId already exists
    const batchExists = await Batch.findOne({ batchId: batchId.trim() });
    if (batchExists) {
      return res.status(400).json({ error: 'Batch ID is already in use' });
    }

    // Verify teacher exists and has Teacher role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(400).json({ error: 'Selected teacher user is invalid or does not have Teacher role' });
    }

    const newBatch = new Batch({
      batchId: batchId.trim(),
      name: name.trim(),
      uniqueKey: uniqueKey.trim(),
      teacherId,
      createdBy: req.user._id
    });

    await newBatch.save();
    const populated = await Batch.findById(newBatch._id).populate('teacherId', 'name username email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a batch
router.put('/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, uniqueKey, teacherId } = req.body;

  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'Teacher') {
        return res.status(400).json({ error: 'Selected teacher is invalid' });
      }
      batch.teacherId = teacherId;
    }

    if (name) batch.name = name.trim();
    if (uniqueKey) batch.uniqueKey = uniqueKey.trim();

    await batch.save();
    const populated = await Batch.findById(batch._id)
      .populate('teacherId', 'name username email')
      .populate('students', 'name username email mobile');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a batch
router.delete('/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Optionally clean up any PDFs uploaded to this batch
    if (batch.pdfs && batch.pdfs.length > 0) {
      batch.pdfs.forEach(pdf => {
        const filename = path.basename(pdf.pdfUrl);
        const filepath = path.join(__dirname, '../uploads/pdfs', filename);
        if (fs.existsSync(filepath)) {
          try {
            fs.unlinkSync(filepath);
          } catch (e) {
            console.error('Failed to delete file:', filepath, e.message);
          }
        }
      });
    }

    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ==========================================
   TEACHER ROUTES (Requires requireRole(['Teacher']))
   ========================================== */

// Get batches assigned to teacher
router.get('/teacher', requireAuth, requireRole(['Teacher']), async (req, res) => {
  try {
    const batches = await Batch.find({ teacherId: req.user._id })
      .populate('students', 'name username email mobile')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add link to a batch
router.post('/teacher/:id/links', requireAuth, requireRole(['Teacher']), async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    const batch = await Batch.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    batch.links.push({ title: title.trim(), url: url.trim(), date: new Date() });
    await batch.save();
    res.status(201).json(batch.links[batch.links.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload a PDF to a batch
router.post('/teacher/:id/pdfs', requireAuth, requireRole(['Teacher']), uploadPdf.single('pdf'), async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file' });
  }

  try {
    const batch = await Batch.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    const pdfsDir = path.join(__dirname, '../uploads/pdfs');
    ensureDirectoryExists(pdfsDir);

    const safeFilename = Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filepath = path.join(pdfsDir, safeFilename);

    fs.writeFileSync(filepath, req.file.buffer);

    const pdfUrl = `/uploads/pdfs/${safeFilename}`;
    const newPdf = {
      title: title.trim(),
      pdfUrl,
      description: description ? description.trim() : '',
      date: new Date()
    };

    batch.pdfs.push(newPdf);
    await batch.save();
    res.status(201).json(batch.pdfs[batch.pdfs.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a notification to a batch
router.post('/teacher/:id/notifications', requireAuth, requireRole(['Teacher']), async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and Message are required' });
  }

  try {
    const batch = await Batch.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    batch.notifications.push({ title: title.trim(), message: message.trim(), date: new Date() });
    await batch.save();
    res.status(201).json(batch.notifications[batch.notifications.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a resource from a batch
router.delete('/teacher/:id/resources/:type/:resourceId', requireAuth, requireRole(['Teacher']), async (req, res) => {
  const { id, type, resourceId } = req.params;

  if (!['links', 'pdfs', 'notifications'].includes(type)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }

  try {
    const batch = await Batch.findOne({ _id: id, teacherId: req.user._id });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    if (type === 'pdfs') {
      const pdf = batch.pdfs.id(resourceId);
      if (pdf) {
        const filename = path.basename(pdf.pdfUrl);
        const filepath = path.join(__dirname, '../uploads/pdfs', filename);
        if (fs.existsSync(filepath)) {
          try {
            fs.unlinkSync(filepath);
          } catch (e) {
            console.error('Failed to delete file:', filepath, e.message);
          }
        }
      }
    }

    batch[type].pull(resourceId);
    await batch.save();
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ==========================================
   STUDENT ROUTES (Requires requireRole(['Student']))
   ========================================== */

// Get all batches joined by student
router.get('/student', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    const batches = await Batch.find({ students: req.user._id })
      .populate('teacherId', 'name email')
      .select('batchId name teacherId createdAt')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a batch using Batch ID and Unique Key
router.post('/student/join', requireAuth, requireRole(['Student']), async (req, res) => {
  const { batchId, uniqueKey } = req.body;

  if (!batchId || !uniqueKey) {
    return res.status(400).json({ error: 'Batch ID and Unique Key are required' });
  }

  try {
    const batch = await Batch.findOne({ 
      batchId: batchId.trim(), 
      uniqueKey: uniqueKey.trim() 
    });

    if (!batch) {
      return res.status(400).json({ error: 'Invalid Batch ID or Unique Key' });
    }

    // Check if student already joined
    if (batch.students.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already joined this batch' });
    }

    batch.students.push(req.user._id);
    await batch.save();

    res.json({ 
      message: 'Joined batch successfully', 
      batch: {
        _id: batch._id,
        batchId: batch.batchId,
        name: batch.name
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed info of a joined batch
router.get('/student/:id', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    const batch = await Batch.findOne({ 
      _id: req.params.id, 
      students: req.user._id 
    }).populate('teacherId', 'name email');

    if (!batch) {
      return res.status(403).json({ error: 'Access denied: You are not enrolled in this batch' });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
