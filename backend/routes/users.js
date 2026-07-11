const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildSearchRegex } = require('../utils/regexSafe');

// Apply Admin restriction to all routes in this file
router.use(requireAuth, requireRole(['Admin']));

// @route   GET /api/users
// @desc    Get all users with pagination and search
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = buildSearchRegex(req.query.search);
    filter.$or = [
      { name: searchRegex },
      { username: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
      { address: searchRegex },
      { role: searchRegex }
    ];
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  try {
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash') // Never return password hash
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  const { username, password, name, email, mobile, address, role, isActive } = req.body;

  if (!username || !password || !name || !email || !role) {
    return res.status(400).json({ error: 'Please provide all required fields: username, password, name, email, role' });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      passwordHash,
      name,
      email,
      mobile: mobile || '',
      address: address || '',
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    await newUser.save();
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;
    
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  const { username, password, name, email, mobile, address, role, isActive } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ error: 'Username is already in use' });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;
    if (address !== undefined) user.address = address;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
