const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public route: GET /api/mentors
// Returns all active mentors sorted by sortOrder ascending (0 shows first)
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Bulk update sort orders: PUT /api/mentors/bulk-sort
router.put('/bulk-sort', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { items } = req.body; // items: [{ id: '...', sortOrder: 1 }, ...]
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

module.exports = router;
