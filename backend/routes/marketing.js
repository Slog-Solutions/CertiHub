const express = require('express');
const router = express.Router();
const MarketingNotification = require('../models/MarketingNotification');
const DeviceToken = require('../models/DeviceToken');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendToTokens } = require('../utils/fcm');

// @route   POST /api/marketing/send-campaign
// @desc    Send a marketing notification to a target audience
// @access  Private (Admin & Staff)
router.post('/send-campaign', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  const { title, message, targetAudience, dataPayload } = req.body;

  if (!title || !message || !targetAudience) {
    return res.status(400).json({ error: 'title, message, and targetAudience are required.' });
  }

  if (!['all', 'anonymous', 'logged_in'].includes(targetAudience)) {
    return res.status(400).json({ error: 'Invalid targetAudience. Must be all, anonymous, or logged_in.' });
  }

  try {
    // Determine the query based on targetAudience
    const query = { isActive: true, isMarketingEnabled: true };
    
    if (targetAudience === 'anonymous') {
      query.userId = null;
    } else if (targetAudience === 'logged_in') {
      query.userId = { $ne: null };
    }
    // For 'all', no additional filters on userId

    // Fetch matching devices
    const devices = await DeviceToken.find(query).select('fcmToken userId').populate('userId', 'marketingEnabled isActive');

    // Filter out users who have globally disabled marketing in their profile
    const validTokens = [];
    devices.forEach(device => {
      if (device.userId) {
        // If user is attached, check user-level preferences
        if (device.userId.isActive !== false && device.userId.marketingEnabled !== false) {
          validTokens.push(device.fcmToken);
        }
      } else {
        // Anonymous device, marketing enabled is checked at device level by query
        validTokens.push(device.fcmToken);
      }
    });

    if (validTokens.length === 0) {
      return res.status(400).json({ error: 'No active devices found for this target audience.' });
    }

    // Send push using existing utility
    const fcmResult = await sendToTokens(validTokens, title.trim(), message.trim(), {
      type: 'marketing',
      audience: targetAudience,
      title: title.trim(),
      message: message.trim(),
      ...(dataPayload || {})
    });

    const successCount = fcmResult.successCount || 0;
    const failureCount = fcmResult.failureCount || 0;

    // Record the campaign
    const campaign = new MarketingNotification({
      title: title.trim(),
      message: message.trim(),
      targetAudience,
      dataPayload: dataPayload || {},
      successCount,
      failureCount,
      sentBy: req.user._id
    });
    
    await campaign.save();

    res.json({
      success: true,
      message: `Marketing campaign sent. Delivered: ${successCount}, Failed: ${failureCount}.`,
      campaign
    });
  } catch (err) {
    console.error('Marketing campaign error:', err.message);
    res.status(500).json({ error: 'Server error while sending marketing campaign' });
  }
});

// @route   GET /api/marketing/campaigns
// @desc    Get all marketing campaigns
// @access  Private (Admin & Staff)
router.get('/campaigns', requireAuth, requireRole(['Admin', 'Staff']), async (req, res) => {
  try {
    const campaigns = await MarketingNotification.find()
      .populate('sentBy', 'name username')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching marketing campaigns' });
  }
});

module.exports = router;
