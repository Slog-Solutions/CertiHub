const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { JWT_SECRET } = require('../config/env');
const rateLimit = require('express-rate-limit');

// Basic brute-force protection on login: 100 attempts per 15 minutes per IP (increased for testing)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide both username and password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    mobile: req.user.mobile,
    address: req.user.address,
    role: req.user.role,
    isActive: req.user.isActive
  });
});

// @route   POST /api/auth/register-student
// @desc    Register a new student account
// @access  Public
router.post('/register-student', async (req, res) => {
  const { username, password, name, email, mobile, address } = req.body;

  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: 'Please provide required fields: username, password, name, email' });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStudent = new User({
      username: username.trim(),
      passwordHash,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile ? mobile.trim() : '',
      address: address ? address.trim() : '',
      role: 'Student',
      isActive: true
    });

    await newStudent.save();

    const userResponse = newStudent.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      message: 'Student account registered successfully',
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
