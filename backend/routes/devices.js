const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const DeviceToken = require('../models/DeviceToken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const { requireAuth } = require('../middleware/auth');

// Middleware to optionally authenticate a user if a token is present
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (err) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

// @route   POST /api/devices/register
// @desc    Register or update a device token (with or without user)
// @access  Public (Optional Auth)
router.post('/register', optionalAuth, async (req, res) => {
  const { installationId, fcmToken, platform } = req.body;

  if (!installationId || !fcmToken) {
    return res.status(400).json({ error: 'installationId and fcmToken are required' });
  }

  try {
    const userId = req.user ? req.user._id : null;
    
    const device = await DeviceToken.findOneAndUpdate(
      { installationId },
      {
        fcmToken,
        platform: platform || 'unknown',
        userId,
        lastSeenAt: Date.now()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, device });
  } catch (err) {
    console.error('Device register error:', err.message);
    res.status(500).json({ error: 'Server error while registering device' });
  }
});

// @route   POST /api/devices/detach-user
// @desc    Detach the current user from this device (called on logout)
// @access  Private
router.post('/detach-user', requireAuth, async (req, res) => {
  const { installationId, fcmToken } = req.body;

  if (!installationId && !fcmToken) {
    return res.status(400).json({ error: 'installationId or fcmToken is required' });
  }

  try {
    const query = {};
    if (installationId) query.installationId = installationId;
    if (fcmToken) query.fcmToken = fcmToken;
    query.userId = req.user._id;

    const device = await DeviceToken.findOneAndUpdate(
      query,
      { $set: { userId: null } },
      { new: true }
    );

    res.json({ success: true, message: 'User detached from device', device });
  } catch (err) {
    console.error('Device detach error:', err.message);
    res.status(500).json({ error: 'Server error while detaching user' });
  }
});

module.exports = router;
