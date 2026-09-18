const express = require('express');
const router = express.Router();
const AppVersion = require('../models/AppVersion');
const { requireAuth, requireRole } = require('../middleware/auth');

// @route   GET /api/app/version
// @desc    Get app version configuration by platform
// @access  Public
router.get('/version', async (req, res) => {
  const { platform } = req.query;

  if (!platform || !['android', 'ios'].includes(platform.toLowerCase())) {
    return res.status(400).json({ error: 'Valid platform query parameter is required (android or ios).' });
  }

  try {
    const config = await AppVersion.findOne({ platform: platform.toLowerCase() });
    
    if (!config) {
      return res.status(404).json({ error: 'Version configuration not found for the specified platform.' });
    }

    res.json({
      latestVersion: config.latestVersion,
      minimumVersion: config.minimumVersion,
      forceUpdate: config.forceUpdate,
      message: config.message
    });
  } catch (err) {
    console.error('Fetch AppVersion error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/app/version/:platform
// @desc    Update app version configuration
// @access  Private (Admin & Staff)
router.put('/version/:platform', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  const { platform } = req.params;
  const { latestVersion, minimumVersion, forceUpdate, message } = req.body;

  if (!['android', 'ios'].includes(platform.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid platform.' });
  }

  if (!latestVersion || !minimumVersion) {
    return res.status(400).json({ error: 'latestVersion and minimumVersion are required.' });
  }

  try {
    const updatedConfig = await AppVersion.findOneAndUpdate(
      { platform: platform.toLowerCase() },
      {
        latestVersion: latestVersion.trim(),
        minimumVersion: minimumVersion.trim(),
        forceUpdate: Boolean(forceUpdate),
        message: message ? message.trim() : ''
      },
      { new: true, upsert: true } // Upsert just in case it was deleted
    );

    res.json({
      success: true,
      message: 'App version configuration updated successfully.',
      config: updatedConfig
    });
  } catch (err) {
    console.error('Update AppVersion error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
