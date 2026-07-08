const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { requireAuth } = require('../middleware/auth');

// Protect routes
router.use(requireAuth);

// @route   GET /api/enquiry
// @desc    Get all enquiries with search, status filter, and pagination
// @access  Private (Admin & Staff)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { courseInterested: searchRegex },
      { message: searchRegex }
    ];
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  try {
    const total = await Enquiry.countDocuments(filter);
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: enquiries,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/enquiry
// @desc    Create a new enquiry
// @access  Private (Admin & Staff)
router.post('/', async (req, res) => {
  const { name, phone, email, courseInterested, message, status } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone are required' });
  }

  try {
    const enquiry = new Enquiry({
      name,
      phone,
      email: email || '',
      courseInterested: courseInterested || '',
      message: message || '',
      status: status || 'New'
    });

    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/enquiry/:id
// @desc    Update an enquiry (including its CRM status level)
// @access  Private (Admin & Staff)
router.put('/:id', async (req, res) => {
  const { name, phone, email, courseInterested, message, status } = req.body;

  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    if (name) enquiry.name = name;
    if (phone) enquiry.phone = phone;
    if (email !== undefined) enquiry.email = email;
    if (courseInterested !== undefined) enquiry.courseInterested = courseInterested;
    if (message !== undefined) enquiry.message = message;
    if (status) enquiry.status = status;

    await enquiry.save();
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/enquiry/:id
// @desc    Delete an enquiry
// @access  Private (Admin & Staff)
router.delete('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
