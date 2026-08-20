const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const Project = require('../models/Project');

/* ─────────────────────────────────────────────
   PUBLIC: List all active projects
───────────────────────────────────────────── */
router.get('/public', async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: List all projects (paginated)
───────────────────────────────────────────── */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);

    res.json({ data, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Create a new project
───────────────────────────────────────────── */
router.post('/', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const { title, description, technologies, imageUrl, liveUrl, githubUrl, isActive } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Normalise technologies — accept array or comma-separated string
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies.map(t => t.trim()).filter(Boolean);
    } else if (typeof technologies === 'string') {
      techArray = technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      technologies: techArray,
      imageUrl: imageUrl?.trim() || '',
      liveUrl: liveUrl?.trim() || '',
      githubUrl: githubUrl?.trim() || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Update a project
───────────────────────────────────────────── */
router.put('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const { title, description, technologies, imageUrl, liveUrl, githubUrl, isActive } = req.body;

    let techArray;
    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        techArray = technologies.map(t => t.trim()).filter(Boolean);
      } else if (typeof technologies === 'string') {
        techArray = technologies.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (techArray !== undefined) updateData.technologies = techArray;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl.trim();
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Delete a project (hard delete)
───────────────────────────────────────────── */
router.delete('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
