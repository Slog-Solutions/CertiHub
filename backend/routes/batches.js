const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const qrcode = require('qrcode');
const Batch = require('../models/Batch');
const User = require('../models/User');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const CourseDetail = require('../models/CourseDetail');
const SystemSetting = require('../models/SystemSetting');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendToTokens, extractUserFcmTokens } = require('../utils/fcm');
const { sendEmail } = require('../utils/mailer');
const { uploadPdfBuffer, deleteByPublicId } = require('../utils/cloudinary');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

// ── Certificate constants ───────────────────────────────────────────────────
const certsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 6; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
  return `CERT-${year}-${r}`;
};

/**
 * Recalculates batch progress percentage server-side from curriculum data.
 * @param {Object} batch - Mongoose Batch document
 * @returns {number} 0-100
 */
const calcProgressPct = (batch) => {
  const curriculum = batch.curriculum || [];
  let totalUnits = 0;
  let completedUnits = 0;
  curriculum.forEach(topic => {
    if (topic.subtopics && topic.subtopics.length > 0) {
      totalUnits += topic.subtopics.length;
      completedUnits += topic.subtopics.filter(s => s.isCompleted).length;
    } else {
      totalUnits += 1;
      completedUnits += topic.isCompleted ? 1 : 0;
    }
  });
  return totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
};

/**
 * Fire-and-forget: auto-generate certificates for all students in a batch
 * when course progress reaches 100%.
 */
const triggerAutoCertificates = async (batch) => {
  try {
    const pct = calcProgressPct(batch);
    if (pct < 100) return; // Not yet complete

    console.log(`[AutoCert] Batch "${batch.name}" reached 100% — generating certificates for ${batch.students.length} student(s).`);

    // Fetch the default certificate template (optional — pdfGenerator uses the HTML file directly)
    let defaultTemplate = await CertificateTemplate.findOne({ isDefault: true });
    if (!defaultTemplate) {
      console.warn('[AutoCert] No default CertificateTemplate found in DB — will still generate using the HTML template file.');
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Process each student in the batch
    for (const studentUserId of batch.students) {
      try {
        const user = await User.findById(studentUserId);
        if (!user || !user.isActive) continue;

        // Link User → Student (registration) by email or username ↔ registrationNo (optional)
        const student = await Student.findOne({
          $or: [
            { email: new RegExp(`^${user.email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') },
            { registrationNo: user.username }
          ]
        }).populate('collegeId').populate('branchId');

        // Check if an Active certificate already exists
        const queryConds = [{ userId: user._id }];
        if (student) queryConds.push({ studentId: student._id });
        const existing = await Certificate.findOne({ $or: queryConds, status: 'Active' });
        if (existing) {
          console.log(`[AutoCert] Certificate already exists for ${user.username} — skipping.`);
          continue;
        }

        const courseDetail = student?.courseDetailId 
          ? await CourseDetail.findById(student.courseDetailId).populate('technologyId').populate('durationId')
          : null;

        const studentData = {
          _id: student ? student._id : null,
          name: (user.name || student?.name || 'Candidate').trim(),
          registrationNo: student?.registrationNo || user.username || `REG-${user._id.toString().slice(-6).toUpperCase()}`,
          collegeId: student?.collegeId || { collegeName: 'SLOG Solutions Private Limited' },
          branchId: student?.branchId || { branchName: user.branch || 'General' }
        };

        const courseDetailData = courseDetail || {
          _id: null,
          technologyId: { name: batch.name ? batch.name.toUpperCase() : 'TRAINING PROGRAM' },
          durationId: { value: 'Complete', unit: 'Course' }
        };

        const certId = generateCertificateId();
        const verificationUrl = `${clientUrl}/verify/${certId}`;
        const qrCodeBase64 = await qrcode.toDataURL(verificationUrl);

        const filename = `${certId}.pdf`;
        const pdfPath = path.join(certsDir, filename);
        const completionDate = new Date();

        await generateCertificatePDF(studentData, courseDetailData, certId, qrCodeBase64, pdfPath, completionDate);

        const pdfUrl = `/uploads/certificates/${filename}`;

        const newCert = new Certificate({
          certificateId: certId,
          studentId: student ? student._id : null,
          userId: user._id,
          batchId: batch._id,
          courseDetailId: courseDetail ? courseDetail._id : null,
          ...(defaultTemplate ? { templateId: defaultTemplate._id } : {}),
          pdfUrl,
          qrCodeUrl: qrCodeBase64,
          issueDate: completionDate,
          status: 'Active'
        });
        await newCert.save();

        console.log(`[AutoCert] ✅ Certificate ${certId} issued for ${studentData.name} (${studentData.registrationNo}).`);

        // Send optional FCM push notification to student
        try {
          const tokens = extractUserFcmTokens(user);
          if (tokens.length > 0) {
            await sendToTokens(
              tokens,
              '🎓 Your Certificate is Ready!',
              `Congratulations ${student.name}! Your course completion certificate has been generated. Open the Candidate Portal to view and download it.`,
              { type: 'certificate', certId, tab: 'certificate' }
            );
          }
        } catch (fcmErr) {
          console.error(`[AutoCert][FCM] Failed to notify ${user.email}:`, fcmErr.message);
        }

      } catch (studentErr) {
        console.error(`[AutoCert] Error processing student ${studentUserId}:`, studentErr.message);
      }
    }
  } catch (err) {
    console.error('[AutoCert] Unexpected error during auto-certificate generation:', err.message);
  }
};

// Helper to find a batch by MongoDB _id or batchId string and verify user access
const findAccessibleBatch = async (batchParamId, user) => {
  if (!batchParamId) return null;
  const isObjId = mongoose.Types.ObjectId.isValid(batchParamId);
  const query = isObjId 
    ? { $or: [{ _id: batchParamId }, { batchId: batchParamId }] }
    : { batchId: batchParamId };

  const batch = await Batch.findOne(query);
  if (!batch) return null;

  // Admins and Staff always have full access to any batch
  if (['Admin', 'Staff'].includes(user?.role)) {
    return batch;
  }

  // Teachers check assignment strictly
  const userIdStr = String(user?._id || '');
  const isAssignedMain = batch.teacherId && String(batch.teacherId) === userIdStr;
  const isAssignedMulti = Array.isArray(batch.teachers) && batch.teachers.some(t => String(t.teacherId || t) === userIdStr);

  if (isAssignedMain || isAssignedMulti) {
    return batch;
  }

  return null;
};

// Multer memory storage — files stay in memory buffer, then go to Cloudinary
const storage = multer.memoryStorage();
const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — Cloudinary free plan limit for raw files
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

const uploadExcel = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed!'));
  }
});

/* ==========================================
   ADMIN ROUTES (Requires requireRole(['Admin']))
   ========================================== */

// Get all batches
router.get('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('teacherId', 'name username email')
      .populate('teachers.teacherId', 'name username email')
      .populate('students', 'name username email mobile generatedPassword')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to validate and structure assigned teachers
const processTeachersInput = async (teachersInput, legacyTeacherId) => {
  let list = [];
  if (Array.isArray(teachersInput) && teachersInput.length > 0) {
    list = teachersInput.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          teacherId: item.teacherId || item._id,
          role: item.role ? String(item.role).trim() : 'Instructor'
        };
      }
      return { teacherId: item, role: 'Instructor' };
    }).filter(t => t.teacherId);
  } else if (legacyTeacherId) {
    list = [{ teacherId: legacyTeacherId, role: 'Lead Instructor' }];
  }

  if (list.length === 0) return { error: 'At least one assigned teacher user is required.' };

  for (const item of list) {
    const teacher = await User.findById(item.teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return { error: `Selected teacher user is invalid or does not have Teacher role.` };
    }
  }

  return { teachers: list, primaryTeacherId: list[0].teacherId };
};

// Create a new batch
router.post('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { batchId, name, uniqueKey, teacherId, teachers } = req.body;

  if (!batchId || !name || !uniqueKey || (!teacherId && (!Array.isArray(teachers) || teachers.length === 0))) {
    return res.status(400).json({ error: 'Please fill all required fields: batchId, name, uniqueKey, and assign at least one Teacher.' });
  }

  try {
    // Check if batchId already exists
    const batchExists = await Batch.findOne({ batchId: batchId.trim() });
    if (batchExists) {
      return res.status(400).json({ error: 'Batch ID is already in use' });
    }

    const teacherRes = await processTeachersInput(teachers, teacherId);
    if (teacherRes.error) {
      return res.status(400).json({ error: teacherRes.error });
    }

    const newBatch = new Batch({
      batchId: batchId.trim(),
      name: name.trim(),
      uniqueKey: uniqueKey.trim(),
      teacherId: teacherRes.primaryTeacherId,
      teachers: teacherRes.teachers,
      createdBy: req.user._id
    });

    await newBatch.save();
    const populated = await Batch.findById(newBatch._id)
      .populate('teacherId', 'name username email')
      .populate('teachers.teacherId', 'name username email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a batch
router.put('/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  const { name, uniqueKey, teacherId, teachers } = req.body;

  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (teachers || teacherId) {
      const teacherRes = await processTeachersInput(teachers, teacherId);
      if (teacherRes.error) {
        return res.status(400).json({ error: teacherRes.error });
      }
      batch.teachers = teacherRes.teachers;
      batch.teacherId = teacherRes.primaryTeacherId;
    }

    if (name) batch.name = name.trim();
    if (uniqueKey) batch.uniqueKey = uniqueKey.trim();

    await batch.save();
    const populated = await Batch.findById(batch._id)
      .populate('teacherId', 'name username email')
      .populate('teachers.teacherId', 'name username email')
      .populate('students', 'name username email mobile generatedPassword');
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

    // Clean up any PDFs uploaded to Cloudinary for this batch
    if (batch.pdfs && batch.pdfs.length > 0) {
      await Promise.allSettled(
        batch.pdfs
          .filter(pdf => pdf.publicId)
          .map(pdf => deleteByPublicId(pdf.publicId, 'raw'))
      );
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

// Get batches assigned to teacher or all batches for Admin/Staff
router.get('/teacher', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Teacher') {
      query = {
        $or: [
          { teacherId: req.user._id },
          { 'teachers.teacherId': req.user._id }
        ]
      };
    }
    const batches = await Batch.find(query)
      .populate('teacherId', 'name username email')
      .populate('teachers.teacherId', 'name username email')
      .populate('students', 'name username email mobile generatedPassword')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add link to a batch
router.post('/teacher/:id/links', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
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

// Upload a PDF to a batch — stored on Cloudinary
router.post('/teacher/:id/pdfs', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), uploadPdf.single('pdf'), async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file' });
  }

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    // Upload to Cloudinary — folder: certyhub/pdfs
    const safeBase = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.pdf$/i, '');
    const uploadResult = await uploadPdfBuffer(
      req.file.buffer,
      'certyhub/pdfs',
      `${Date.now()}_${safeBase}`
    );

    const newPdf = {
      title: title.trim(),
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      description: description ? description.trim() : '',
      date: new Date()
    };

    batch.pdfs.push(newPdf);
    await batch.save();
    res.status(201).json(batch.pdfs[batch.pdfs.length - 1]);
  } catch (err) {
    console.error('[Cloudinary] PDF upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload PDF to Cloudinary.' });
  }
});

// Add a notification to a batch & fire Firebase push to all enrolled candidates
router.post('/teacher/:id/notifications', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and Message are required' });
  }

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    const newNotification = {
      title: title.trim(),
      message: message.trim(),
      date: new Date()
    };

    batch.notifications.push(newNotification);
    await batch.save();

    const created = batch.notifications[batch.notifications.length - 1];

    // Fire Firebase FCM push to all students who have registered their FCM token
    // Do this asynchronously so the response is not delayed
    (async () => {
      try {
        const students = await User.find({
          _id: { $in: batch.students },
          isActive: true
        }).select('name email fcmToken fcmTokenWeb fcmTokenAndroid fcmTokenIos fcmTokens');

        const tokens = students.flatMap(s => extractUserFcmTokens(s));

        if (tokens.length > 0) {
          const fcmResult = await sendToTokens(tokens, title.trim(), message.trim(), {
            type: 'announcement',
            audience: 'student',
            batchId: batch._id.toString(),
            tab: 'resources',
            title: title.trim(),
            message: message.trim()
          });
          console.log(`[FCM] Announcement push sent: ${fcmResult.successCount}/${tokens.length} delivered for batch "${batch.name}"`);
        } else {
          console.log(`[FCM] No FCM tokens registered for batch "${batch.name}" (total candidates in batch: ${batch.students?.length || 0}) — skipping push.`);
        }
      } catch (fcmErr) {
        console.error('[FCM] Error sending announcement push:', fcmErr.message);
      }
    })();

    res.status(201).json({
      ...created.toObject(),
      broadcastSuccess: true,
      studentsCount: batch.students?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a resource from a batch
router.delete('/teacher/:id/resources/:type/:resourceId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { id, type, resourceId } = req.params;

  if (!['links', 'pdfs', 'notifications'].includes(type)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }

  try {
    const batch = await findAccessibleBatch(id, req.user);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you' });
    }

    // For PDFs: delete from Cloudinary before removing from DB
    if (type === 'pdfs') {
      const pdf = batch.pdfs.id(resourceId);
      if (pdf && pdf.publicId) {
        try {
          await deleteByPublicId(pdf.publicId, 'raw');
        } catch (cloudErr) {
          console.error('[Cloudinary] Failed to delete PDF:', pdf.publicId, cloudErr.message);
          // Non-fatal — continue with DB removal
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
   CURRICULUM ROUTES (Teacher)
   ========================================== */

// Helper: recalculate topic isCompleted based on its subtopics
const syncTopicCompletion = (topic) => {
  if (topic.subtopics && topic.subtopics.length > 0) {
    const allDone = topic.subtopics.every(s => s.isCompleted);
    topic.isCompleted = allDone;
    topic.completedAt = allDone ? (topic.completedAt || new Date()) : null;
  }
};

// Upload / append curriculum topics for a batch (JSON array)
router.post('/teacher/:id/curriculum', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { topics } = req.body; // array of { title, description, subtopics: string[] }
  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: 'topics must be a non-empty array' });
  }

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    const startOrder = batch.curriculum.length;
    const newTopics = topics.map((t, i) => ({
      title: (t.title || '').trim(),
      description: (t.description || '').trim(),
      subtopics: Array.isArray(t.subtopics)
        ? t.subtopics
            .map(s => ({ title: String(s).trim(), isCompleted: false, completedAt: null }))
            .filter(s => s.title)
        : [],
      order: startOrder + i,
      isCompleted: false,
      completedAt: null,
    })).filter(t => t.title);

    batch.curriculum.push(...newTopics);
    await batch.save();
    res.status(201).json(batch.curriculum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a single curriculum topic (title, description, subtopics)
router.put('/teacher/:id/curriculum/:topicId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { title, description, subtopics } = req.body;
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    const topic = batch.curriculum.id(req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    if (title !== undefined) topic.title = title.trim();
    if (description !== undefined) topic.description = description.trim();
    if (Array.isArray(subtopics)) {
      // Preserve completion state for subtopics whose title matches existing ones
      const existingMap = {};
      topic.subtopics.forEach(s => { existingMap[s.title] = s; });
      topic.subtopics = subtopics
        .map(s => String(s).trim())
        .filter(Boolean)
        .map(t => {
          const existing = existingMap[t];
          return {
            title: t,
            isCompleted: existing ? existing.isCompleted : false,
            completedAt: existing ? existing.completedAt : null,
          };
        });
      syncTopicCompletion(topic);
    }

    await batch.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a curriculum TOPIC as complete or incomplete
// (Only applies when topic has NO subtopics; otherwise subtopics drive completion)
router.patch('/teacher/:id/curriculum/:topicId/complete', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { isCompleted } = req.body;
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    const topic = batch.curriculum.id(req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    if (topic.subtopics && topic.subtopics.length > 0) {
      // Mark all subtopics complete/incomplete together
      topic.subtopics.forEach(s => {
        s.isCompleted = !!isCompleted;
        s.completedAt = isCompleted ? new Date() : null;
      });
      syncTopicCompletion(topic);
    } else {
      topic.isCompleted = !!isCompleted;
      topic.completedAt = isCompleted ? new Date() : null;
    }

    await batch.save();
    res.json(topic);

    // ── Auto-certificate trigger (fire-and-forget) ──────────────────────────
    if (!!isCompleted) {
      setImmediate(() => triggerAutoCertificates(batch));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a single SUBTOPIC as complete or incomplete
router.patch('/teacher/:id/curriculum/:topicId/subtopics/:subtopicId/complete', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { isCompleted } = req.body;
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    const topic = batch.curriculum.id(req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const subtopic = topic.subtopics.id(req.params.subtopicId);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });

    subtopic.isCompleted = !!isCompleted;
    subtopic.completedAt = isCompleted ? new Date() : null;

    // Auto-sync parent topic completion
    syncTopicCompletion(topic);

    await batch.save();
    res.json({ topic, subtopic });

    // ── Auto-certificate trigger (fire-and-forget) ──────────────────────────
    if (!!isCompleted) {
      setImmediate(() => triggerAutoCertificates(batch));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a single curriculum topic
router.delete('/teacher/:id/curriculum/:topicId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    batch.curriculum.pull(req.params.topicId);
    await batch.save();
    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear the entire curriculum for a batch
router.delete('/teacher/:id/curriculum', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    batch.curriculum = [];
    await batch.save();
    res.json({ message: 'Curriculum cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk candidate registration via Excel upload for a batch by Expert/Admin
router.post('/teacher/:id/bulk-register-excel', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), uploadExcel.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an Excel (.xlsx, .xls) or CSV file.' });
  }

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'Excel file is empty or corrupted.' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No data rows found in the uploaded Excel file.' });
    }

    const results = [];
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const parseExcelDate = (val) => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) return val;
  if (typeof val === 'number') {
    const parsed = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(parsed) ? null : parsed;
  }
  const str = String(val).trim();
  const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return isNaN(d) ? null : d;
  }
  const parsed = new Date(str);
  return isNaN(parsed) ? null : parsed;
};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Normalize header matching for user's Excel headers:
      // FullName, DateOfBirth, Gender, Email, PhoneNumber, PermanentAddress, WorkingStatus/WorkingState, Branch/Department, YearOfStudy, TrainingTechnology, PaymentTerm
      const fullName = (row['FullName'] || row['Full Name'] || row['Name'] || row['Candidate Name'] || row['CandidateName'] || '').toString().trim();
      const email = (row['Email'] || row['Email Address'] || row['EmailAddress'] || '').toString().trim().toLowerCase();
      const phone = (row['PhoneNumber'] || row['Phone Number'] || row['Phone'] || row['Mobile'] || '').toString().trim();
      const dobRaw = row['DateOfBirth'] || row['Date Of Birth'] || row['DOB'] || '';
      const dobParsed = parseExcelDate(dobRaw);
      const gender = (row['Gender'] || '').toString().trim();
      const address = (row['PermanentAddress'] || row['Permanent Address'] || row['Address'] || '').toString().trim();
      const state = (row['WorkingStatus'] || row['Working Status'] || row['WorkingState'] || row['Working State'] || row['State'] || '').toString().trim();
      const branch = (row['Branch/Department'] || row['Branch / Department'] || row['Branch'] || row['Department'] || '').toString().trim();
      const year = (row['YearOfStudy'] || row['Year Of Study'] || row['Year'] || '').toString().trim();
      const technology = (row['TrainingTechnology'] || row['Training Technology'] || row['Technology'] || '').toString().trim();
      const paymentTerm = (row['PaymentTerm'] || row['Payment Term'] || row['PaymentTerms'] || '').toString().trim();

      if (!fullName || !email) {
        continue; // Skip rows missing mandatory Name or Email
      }

      // Generate unique Username (Format: STP-YYYY-XXXXX)
      let username = '';
      let isUnique = false;
      const yearStr = new Date().getFullYear();
      while (!isUnique) {
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        username = `STP-${yearStr}-${rand}`;
        const existingUser = await User.findOne({ username });
        if (!existingUser) isUnique = true;
      }

      // Generate random secure password (e.g. Slog@4912)
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const plainPassword = `Slog@${randNum}`;
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      // Upsert User record
      let user = await User.findOne({ email });
      let alreadyExisted = false;

      if (user) {
        alreadyExisted = true;
        if (user.role !== 'Student') {
          user.role = 'Student';
        }
        if (plainPassword) {
          user.passwordHash = passwordHash;
          user.generatedPassword = plainPassword;
        }
        if (fullName) user.name = fullName;
        if (phone) user.mobile = phone;
        if (address) user.address = address;
        if (dobParsed) user.dob = dobParsed;
        if (gender) user.gender = gender;
        if (state) user.state = state;
        if (branch) user.branch = branch;
        if (year) user.year = year;
        if (technology) user.technology = technology;
        await user.save();
      } else {
        user = new User({
          username,
          passwordHash,
          generatedPassword: plainPassword,
          name: fullName,
          email,
          mobile: phone,
          address,
          dob: dobParsed,
          gender,
          state,
          branch,
          year,
          technology,
          role: 'Student',
          isActive: true
        });
        await user.save();
      }

      // Upsert Student Profile document
      try {
        let studentProfile = await Student.findOne({
          $or: [{ email: user.email }, { registrationNo: user.username }]
        });
        if (!studentProfile) {
          studentProfile = new Student({
            registrationNo: user.username,
            name: fullName,
            fatherName: 'N/A',
            dob: dobParsed || new Date(),
            gender: gender || 'Not Specified',
            email: email,
            phone: phone ? phone.replace(/\D/g, '').padStart(10, '0').slice(-10) : '0000000000',
            address: address || 'N/A',
            state: state || '',
            year: year || '',
            trainingType: technology || '',
            totalFee: 0
          });
        } else {
          studentProfile.name = fullName;
          if (dobParsed) studentProfile.dob = dobParsed;
          if (gender) studentProfile.gender = gender;
          if (address) studentProfile.address = address;
          if (state) studentProfile.state = state;
          if (year) studentProfile.year = year;
          if (technology) studentProfile.trainingType = technology;
        }
        await studentProfile.save();
      } catch (e) {
        console.error('Student profile upsert error:', e.message);
      }

      // Enroll in Batch
      if (!batch.students.includes(user._id)) {
        batch.students.push(user._id);
      }

      // Send Login Credentials via SMTP Email
      let emailResult = { success: false, reason: 'Skipped' };
      const candPass = user.generatedPassword || plainPassword;
      try {
        emailResult = await sendEmail({
          to: email,
          subject: `🎓 Your Candidate Portal Credentials - ${batch.name}`,
          text: `Hello ${fullName},\n\nYou have been registered for batch "${batch.name}" (${batch.batchId}) at Slog Solutions.\n\nLogin URL: ${clientUrl}/user\nEnrolled Batch: ${batch.name}\nUsername: ${user.username}\nPassword: ${candPass}\n\nSimply log in to access your course curriculum, resources, and announcements automatically!\n\nBest Regards,\nSlog Solutions Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #10b981; padding-bottom: 16px;">
                <h2 style="color: #0f172a; margin: 0; font-size: 22px;">🎓 Slog Solutions Candidate Portal</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Official Course & Batch Enrollment Credentials</p>
              </div>
              <p style="font-size: 15px; color: #1e293b; margin-bottom: 12px;">Dear <strong>${fullName}</strong>,</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 18px;">
                Congratulations! You have been registered and enrolled into course batch <strong>"${batch.name}"</strong> (Batch Code: <code>${batch.batchId}</code>) by your instructor.
              </p>
              <div style="background: #f8fafc; border: 1.5px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">🔑 Your Login Credentials:</h4>
                <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Login Portal:</strong> <a href="${clientUrl}/user" style="color: #10b981; font-weight: bold; text-decoration: underline;">${clientUrl}/user</a></p>
                <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Enrolled Course / Batch:</strong> <span style="color: #8b5cf6; font-weight: bold;">${batch.name}</span></p>
                <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Username:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 6px; color: #0f172a; font-weight: bold; font-family: monospace;">${user.username}</code></p>
                <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Password:</strong> <code style="background: #d1fae5; padding: 3px 8px; border-radius: 6px; color: #047857; font-weight: bold; font-family: monospace;">${candPass}</code></p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                ⚡ <em>Automatic Course Access: When you log in with your credentials above, your enrolled course curriculum, live links, PDFs, and announcements will load automatically — no join key required!</em>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Slog Solutions Private Limited · Automated Notification System</p>
            </div>
          `
        });
      } catch (mailErr) {
        emailResult = { success: false, reason: mailErr.message };
      }

      results.push({
        fullName,
        email,
        phone,
        username: user.username,
        password: user.generatedPassword || plainPassword,
        emailSent: emailResult.success,
        alreadyExisted,
        technology,
        branch
      });
    }

    await batch.save();

    res.json({
      success: true,
      message: `Successfully processed ${results.length} candidate(s) and enrolled them into batch "${batch.name}".`,
      totalProcessed: results.length,
      candidates: results
    });

  } catch (err) {
    console.error('Bulk registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to process bulk registration.' });
  }
});

// Remove/Delete a student from a batch and permanently from database by Expert
router.delete('/teacher/:id/students/:studentId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you.' });
    }

    const studentId = req.params.studentId;

    // Pull student from batch
    batch.students.pull(studentId);
    await batch.save();

    // Delete User record & Student profile record permanently from database
    const user = await User.findById(studentId);
    if (user && user.role === 'Student') {
      await Student.deleteMany({
        $or: [{ email: user.email }, { registrationNo: user.username }]
      });
      await User.findByIdAndDelete(studentId);
    }

    res.json({ message: 'Candidate deleted from database and batch successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get full details of a specific candidate student for Expert
router.get('/teacher/:id/students/:studentId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you.' });
    }

    const user = await User.findById(req.params.studentId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Candidate record not found.' });
    }

    let profile = await Student.findOne({
      $or: [{ email: user.email }, { registrationNo: user.username }]
    });

    res.json({
      user,
      profile: profile || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/Edit candidate student details by Expert
router.put('/teacher/:id/students/:studentId', requireAuth, requireRole(['Teacher', 'Admin', 'Staff']), async (req, res) => {
  const { name, email, mobile, username, password, address, dob, gender, branch, state, technology, year } = req.body;

  try {
    const batch = await findAccessibleBatch(req.params.id, req.user);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or not assigned to you.' });
    }

    const user = await User.findById(req.params.studentId);
    if (!user) {
      return res.status(404).json({ error: 'Candidate record not found.' });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (mobile) user.mobile = mobile.trim();
    if (address) user.address = address.trim();
    if (gender) user.gender = gender.trim();
    if (state) user.state = state.trim();
    if (branch) user.branch = branch.trim();
    if (year) user.year = year.trim();
    if (technology) user.technology = technology.trim();
    if (dob) {
      const parsedDob = parseExcelDate(dob);
      if (parsedDob) user.dob = parsedDob;
    }

    if (username && username.trim() !== user.username) {
      const unameExists = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
      if (unameExists) return res.status(400).json({ error: 'Username is already in use by another candidate.' });
      user.username = username.trim();
    }

    if (password && password.trim()) {
      user.generatedPassword = password.trim();
      user.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    // Update Student profile record if present
    try {
      let studentProfile = await Student.findOne({
        $or: [{ email: user.email }, { registrationNo: user.username }]
      });

      if (studentProfile) {
        if (name) studentProfile.name = name.trim();
        if (email) studentProfile.email = email.trim().toLowerCase();
        if (mobile) studentProfile.phone = mobile.trim().replace(/\D/g, '').padStart(10, '0').slice(-10);
        if (address) studentProfile.address = address.trim();
        if (gender) studentProfile.gender = gender.trim();
        if (state) studentProfile.state = state.trim();
        if (year) studentProfile.year = year.trim();
        if (technology) studentProfile.trainingType = technology.trim();
        if (dob) studentProfile.dob = new Date(dob);
        await studentProfile.save();
      }
    } catch (e) {
      // profile sync error fallback
    }

    res.json({ message: 'Candidate details updated successfully!', user });
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
      .populate('teachers.teacherId', 'name email')
      .select('batchId name teacherId teachers createdAt')
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
    })
      .populate('teacherId', 'name email')
      .populate('teachers.teacherId', 'name email');

    if (!batch) {
      return res.status(403).json({ error: 'Access denied: You are not enrolled in this batch' });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request / auto-generate a certificate for the calling student in a batch (if progress = 100%)
router.post('/student/:id/request-certificate', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, students: req.user._id });
    if (!batch) return res.status(403).json({ error: 'Access denied: You are not enrolled in this batch' });

    const pct = calcProgressPct(batch);
    if (pct < 100) {
      return res.status(400).json({ error: `Course not yet complete (${pct}%). Complete all topics to earn your certificate.` });
    }

    const user = req.user;

    // Link User → Student (registration) by email or username ↔ registrationNo (optional)
    const student = await Student.findOne({
      $or: [
        { email: new RegExp(`^${user.email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') },
        { registrationNo: user.username }
      ]
    }).populate('collegeId').populate('branchId');

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Fetch course detail if available
    const courseDetail = student?.courseDetailId
      ? await CourseDetail.findById(student.courseDetailId).populate('technologyId').populate('durationId')
      : null;

    const studentData = {
      _id: student ? student._id : null,
      name: (user.name || student?.name || 'Candidate').trim(),
      registrationNo: student?.registrationNo || user.username || `REG-${user._id.toString().slice(-6).toUpperCase()}`,
      collegeId: student?.collegeId || { collegeName: 'SLOG Solutions Private Limited' },
      branchId: student?.branchId || { branchName: user.branch || 'General' }
    };

    const courseDetailData = courseDetail || {
      _id: null,
      technologyId: { name: batch.name ? batch.name.toUpperCase() : 'TRAINING PROGRAM' },
      durationId: { value: 'Complete', unit: 'Course' }
    };

    // Check if cert already exists
    const queryConds = [{ userId: user._id }];
    if (student) queryConds.push({ studentId: student._id });
    let existing = await Certificate.findOne({ $or: queryConds, status: 'Active' });

    if (existing) {
      // Re-generate PDF with latest candidate full name & details
      const certId = existing.certificateId;
      const verificationUrl = `${clientUrl}/verify/${certId}`;
      const qrCodeBase64 = await qrcode.toDataURL(verificationUrl);
      const filename = `${certId}.pdf`;
      const pdfPath = path.join(certsDir, filename);

      await generateCertificatePDF(studentData, courseDetailData, certId, qrCodeBase64, pdfPath, existing.issueDate || new Date());
      existing.pdfUrl = `/uploads/certificates/${filename}?v=${Date.now()}`;
      existing.qrCodeUrl = qrCodeBase64;
      await existing.save();

      return res.json({ message: 'Certificate updated with full name', certificate: existing, alreadyExists: true });
    }

    const certId = generateCertificateId();
    const verificationUrl = `${clientUrl}/verify/${certId}`;
    const qrCodeBase64 = await qrcode.toDataURL(verificationUrl);
    const filename = `${certId}.pdf`;
    const pdfPath = path.join(certsDir, filename);
    const completionDate = new Date();

    await generateCertificatePDF(studentData, courseDetailData, certId, qrCodeBase64, pdfPath, completionDate);

    const pdfUrl = `/uploads/certificates/${filename}`;
    const defaultTemplate = await CertificateTemplate.findOne({ isDefault: true });

    const newCert = new Certificate({
      certificateId: certId,
      studentId: student ? student._id : null,
      userId: user._id,
      batchId: batch._id,
      courseDetailId: courseDetail ? courseDetail._id : null,
      ...(defaultTemplate ? { templateId: defaultTemplate._id } : {}),
      pdfUrl,
      qrCodeUrl: qrCodeBase64,
      issueDate: completionDate,
      status: 'Active'
    });
    await newCert.save();

    console.log(`[CertRequest] ✅ Certificate ${certId} generated for candidate ${studentData.name} (${studentData.registrationNo}).`);
    res.status(201).json({ message: 'Certificate generated successfully', certificate: newCert });
  } catch (err) {
    console.error('[CertRequest] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   FEEDBACK ROUTES
   ========================================== */

// Student: Submit or update feedback for a batch (one per student, upsert)
router.post('/student/:id/feedback', requireAuth, requireRole(['Student']), async (req, res) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const batch = await Batch.findOne({ _id: req.params.id, students: req.user._id });
    if (!batch) return res.status(403).json({ error: 'You are not enrolled in this batch' });

    // Upsert: update existing or push new
    const existing = batch.feedback.find(f => f.studentId.toString() === req.user._id.toString());
    if (existing) {
      existing.rating = Number(rating);
      existing.review = (review || '').trim();
      existing.date = new Date();
    } else {
      batch.feedback.push({
        studentId: req.user._id,
        studentName: req.user.name || '',
        rating: Number(rating),
        review: (review || '').trim(),
        date: new Date()
      });
    }

    await batch.save();
    const mine = batch.feedback.find(f => f.studentId.toString() === req.user._id.toString());
    res.json(mine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student: Get their own feedback for a batch
router.get('/student/:id/feedback/mine', requireAuth, requireRole(['Student']), async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, students: req.user._id });
    if (!batch) return res.status(403).json({ error: 'Access denied' });

    const mine = batch.feedback.find(f => f.studentId.toString() === req.user._id.toString()) || null;
    res.json(mine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher: Get all feedback for a batch with aggregate stats
router.get('/teacher/:id/feedback', requireAuth, requireRole(['Teacher']), async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!batch) return res.status(404).json({ error: 'Batch not found or not assigned to you' });

    const feedback = batch.feedback || [];
    const avg = feedback.length
      ? Math.round((feedback.reduce((s, f) => s + f.rating, 0) / feedback.length) * 10) / 10
      : null;

    res.json({ feedback, avgRating: avg, totalReviews: feedback.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   PUBLIC BOOTCAMP REGISTRATION & ADMIN CONFIG ROUTES
   ========================================== */

// @route   GET /api/batches/public-bootcamp-info
// @route   GET /api/batches/public-bootcamp-info/:batchId
// @desc    Get details of batch assigned for public registration
router.get('/public-bootcamp-info', async (req, res) => {
  try {
    let batch = null;

    // 1. Check SystemSetting key for active public bootcamp batch
    const setting = await SystemSetting.findOne({ key: 'active_public_bootcamp_batch' });
    if (setting && setting.value) {
      batch = await Batch.findById(setting.value).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    // 2. Fallback to batch marked as default public bootcamp
    if (!batch) {
      batch = await Batch.findOne({ isDefaultPublicBootcamp: true }).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    // 3. Fallback to batch marked with public registration active
    if (!batch) {
      batch = await Batch.findOne({ isPublicRegistrationActive: true }).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    // 4. Fallback to latest batch
    if (!batch) {
      batch = await Batch.findOne().sort({ createdAt: -1 }).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    if (!batch) {
      return res.status(404).json({ error: 'No bootcamp batch is currently available for registration.' });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public-bootcamp-info/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const isObjId = mongoose.Types.ObjectId.isValid(batchId);
    const query = isObjId ? { $or: [{ _id: batchId }, { batchId }] } : { batchId };
    
    const batch = await Batch.findOne(query).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    if (!batch) {
      return res.status(404).json({ error: 'Specified bootcamp batch was not found.' });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/batches/public-bootcamp-register
// @desc    Public route to register a candidate into the active or specified bootcamp batch
router.post('/public-bootcamp-register', async (req, res) => {
  try {
    const {
      batchId,
      name,
      fatherName,
      dob,
      gender,
      email,
      phone,
      address,
      state,
      city,
      branch,
      year,
      technology
    } = req.body;

    const trimmedName = (name || '').toString().trim();
    const trimmedEmail = (email || '').toString().trim().toLowerCase();
    const trimmedPhone = (phone || '').toString().trim().replace(/\D/g, '');

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({ error: 'Full Name and Email Address are mandatory.' });
    }

    if (trimmedPhone && trimmedPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must be a valid 10-digit number.' });
    }

    // 1. Resolve Target Batch
    let batch = null;
    if (batchId) {
      const isObjId = mongoose.Types.ObjectId.isValid(batchId);
      batch = await Batch.findOne(isObjId ? { $or: [{ _id: batchId }, { batchId }] } : { batchId });
    }

    if (!batch) {
      const setting = await SystemSetting.findOne({ key: 'active_public_bootcamp_batch' });
      if (setting && setting.value) {
        batch = await Batch.findById(setting.value);
      }
    }

    if (!batch) {
      batch = await Batch.findOne({ isDefaultPublicBootcamp: true });
    }

    if (!batch) {
      batch = await Batch.findOne({ isPublicRegistrationActive: true });
    }

    if (!batch) {
      batch = await Batch.findOne().sort({ createdAt: -1 });
    }

    if (!batch) {
      return res.status(404).json({ error: 'No active bootcamp batch is configured for public registration.' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 2. Generate Username & Password
    let username = '';
    let isUnique = false;
    const yearStr = new Date().getFullYear();
    while (!isUnique) {
      const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
      username = `STP-${yearStr}-${rand}`;
      const existingUser = await User.findOne({ username });
      if (!existingUser) isUnique = true;
    }

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const plainPassword = `Slog@${randNum}`;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 3. Upsert User
    let user = await User.findOne({ email: trimmedEmail });
    let isNewUser = false;

    if (user) {
      if (user.role !== 'Student') {
        user.role = 'Student';
      }
      if (!user.generatedPassword) {
        user.passwordHash = passwordHash;
        user.generatedPassword = plainPassword;
      }
      if (trimmedName) user.name = trimmedName;
      if (trimmedPhone) user.mobile = trimmedPhone;
      if (address) user.address = address;
      if (dob) user.dob = new Date(dob);
      if (gender) user.gender = gender;
      if (state) user.state = state;
      if (branch) user.branch = branch;
      if (year) user.year = year;
      if (technology) user.technology = technology;
      await user.save();
    } else {
      isNewUser = true;
      user = new User({
        username,
        passwordHash,
        generatedPassword: plainPassword,
        name: trimmedName,
        email: trimmedEmail,
        mobile: trimmedPhone || '0000000000',
        address: address || '',
        dob: dob ? new Date(dob) : null,
        gender: gender || '',
        state: state || '',
        branch: branch || '',
        year: year || '',
        technology: technology || '',
        role: 'Student',
        isActive: true
      });
      await user.save();
    }

    // 4. Upsert Student Profile
    try {
      let studentProfile = await Student.findOne({
        $or: [{ email: user.email }, { registrationNo: user.username }]
      });
      if (!studentProfile) {
        studentProfile = new Student({
          registrationNo: user.username,
          name: trimmedName,
          fatherName: fatherName || 'N/A',
          dob: dob ? new Date(dob) : new Date(),
          gender: gender || 'Not Specified',
          email: trimmedEmail,
          phone: trimmedPhone || '0000000000',
          address: address || 'N/A',
          state: state || '',
          city: city || '',
          year: year || '',
          trainingType: technology || 'Bootcamp',
          totalFee: 0
        });
      } else {
        studentProfile.name = trimmedName;
        if (fatherName) studentProfile.fatherName = fatherName;
        if (dob) studentProfile.dob = new Date(dob);
        if (gender) studentProfile.gender = gender;
        if (address) studentProfile.address = address;
        if (state) studentProfile.state = state;
        if (city) studentProfile.city = city;
        if (year) studentProfile.year = year;
        if (technology) studentProfile.trainingType = technology;
      }
      await studentProfile.save();
    } catch (profileErr) {
      console.error('Bootcamp student profile save error:', profileErr.message);
    }

    // 5. Enroll student into batch automatically
    const isAlreadyEnrolled = batch.students.some(sId => sId.toString() === user._id.toString());
    if (!isAlreadyEnrolled) {
      batch.students.push(user._id);
      await batch.save();
    }

    // 6. Send Email Credentials via SMTP
    const studentPassword = user.generatedPassword || plainPassword;
    let emailResult = { success: false };
    try {
      emailResult = await sendEmail({
        to: trimmedEmail,
        subject: `🎉 Registration Confirmed: ${batch.name} - Candidate Login Credentials`,
        text: `Hello ${trimmedName},\n\nCongratulations! You have successfully registered for the bootcamp batch "${batch.name}" (Batch ID: ${batch.batchId}) at Slog Solutions.\n\nLogin URL: ${clientUrl}/user\nEnrolled Batch: ${batch.name}\nUsername: ${user.username}\nPassword: ${studentPassword}\n\nSimply log in to access your course curriculum, learning materials, and batch updates automatically!\n\nBest Regards,\nSlog Solutions Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #10b981; padding-bottom: 16px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 22px;">🎓 Slog Solutions Candidate Portal</h2>
              <p style="color: #10b981; font-weight: bold; font-size: 14px; margin-top: 6px;">Bootcamp Registration Successful!</p>
            </div>
            <p style="font-size: 15px; color: #1e293b; margin-bottom: 12px;">Dear <strong>${trimmedName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 18px;">
              Congratulations! Your registration for <strong>"${batch.name}"</strong> (Batch Code: <code>${batch.batchId}</code>) is confirmed. You have been automatically enrolled into the batch.
            </p>
            <div style="background: #f8fafc; border: 1.5px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">🔑 Your Login Credentials:</h4>
              <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Login Portal:</strong> <a href="${clientUrl}/user" style="color: #10b981; font-weight: bold; text-decoration: underline;">${clientUrl}/user</a></p>
              <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Enrolled Batch:</strong> <span style="color: #8b5cf6; font-weight: bold;">${batch.name}</span></p>
              <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Username:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 6px; color: #0f172a; font-weight: bold; font-family: monospace;">${user.username}</code></p>
              <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Password:</strong> <code style="background: #d1fae5; padding: 3px 8px; border-radius: 6px; color: #047857; font-weight: bold; font-family: monospace;">${studentPassword}</code></p>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
              When you log into your Candidate Portal, your bootcamp batch <strong>${batch.name}</strong> will automatically appear in your active batches list.
            </p>
            <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Slog Solutions Candidate Portal &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Bootcamp registration mail send error:', mailErr.message);
    }

    return res.json({
      success: true,
      message: isAlreadyEnrolled 
        ? 'You are already registered for this bootcamp! Registration credentials have been re-sent to your email.' 
        : 'Registration successful! Your login credentials have been sent to your email.',
      student: {
        name: user.name,
        email: user.email,
        username: user.username,
        password: studentPassword
      },
      batch: {
        id: batch._id,
        batchId: batch.batchId,
        name: batch.name
      },
      emailSent: emailResult.success
    });
  } catch (err) {
    console.error('Public bootcamp registration error:', err);
    res.status(500).json({ error: err.message || 'Bootcamp registration failed. Please try again.' });
  }
});

// @route   GET /api/batches/admin/public-bootcamp-config
// @desc    Get admin public bootcamp configuration and active assigned batch
router.get('/admin/public-bootcamp-config', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: 'active_public_bootcamp_batch' });
    let activeBatch = null;
    if (setting && setting.value) {
      activeBatch = await Batch.findById(setting.value).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    if (!activeBatch) {
      activeBatch = await Batch.findOne({ isDefaultPublicBootcamp: true }).select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt');
    }

    const batches = await Batch.find().select('batchId name uniqueKey isPublicRegistrationActive isDefaultPublicBootcamp createdAt').sort({ createdAt: -1 });

    res.json({
      activeBatchId: activeBatch ? activeBatch._id : null,
      activeBatch,
      batches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/batches/admin/set-active-public-bootcamp
// @desc    Set the active public bootcamp batch for the public registration route
router.post('/admin/set-active-public-bootcamp', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { batchId, isPublicRegistrationActive } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'Please select a batch to assign to the public registration route.' });
    }

    const targetBatch = await Batch.findById(batchId);
    if (!targetBatch) {
      return res.status(404).json({ error: 'Selected batch was not found.' });
    }

    // 1. Update SystemSetting
    await SystemSetting.findOneAndUpdate(
      { key: 'active_public_bootcamp_batch' },
      { key: 'active_public_bootcamp_batch', value: targetBatch._id, description: 'Batch assigned to public bootcamp registration route' },
      { upsert: true, new: true }
    );

    // 2. Unset default flag on all other batches
    await Batch.updateMany({ _id: { $ne: targetBatch._id } }, { isDefaultPublicBootcamp: false });

    // 3. Mark target batch as default public bootcamp and set public registration flag
    targetBatch.isDefaultPublicBootcamp = true;
    targetBatch.isPublicRegistrationActive = isPublicRegistrationActive !== undefined ? Boolean(isPublicRegistrationActive) : true;
    await targetBatch.save();

    res.json({
      success: true,
      message: `Batch "${targetBatch.name}" (${targetBatch.batchId}) is now assigned as the Active Public Bootcamp Batch!`,
      activeBatch: targetBatch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/batches/admin/:id/toggle-public
// @desc    Toggle public registration status for a batch
router.patch('/admin/:id/toggle-public', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const { isPublicRegistrationActive } = req.body;
    batch.isPublicRegistrationActive = isPublicRegistrationActive !== undefined ? Boolean(isPublicRegistrationActive) : !batch.isPublicRegistrationActive;
    await batch.save();

    res.json({
      success: true,
      message: `Public registration ${batch.isPublicRegistrationActive ? 'enabled' : 'disabled'} for batch "${batch.name}".`,
      batch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
