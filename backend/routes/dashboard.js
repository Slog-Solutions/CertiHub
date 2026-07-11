const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const CourseDetail = require('../models/CourseDetail');
const Certificate = require('../models/Certificate');
const FeePayment = require('../models/FeePayment');
const Technology = require('../models/Technology');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard metrics and charts aggregation data
// @access  Private (Admin & Staff)
router.get('/stats', async (req, res) => {
  try {
    // 1. Top Cards Aggregate Computations
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Technology.countDocuments({ isActive: true });
    
    // Sum of all payments (Total Revenue)
    const paymentSumResult = await FeePayment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = paymentSumResult.length > 0 ? paymentSumResult[0].total : 0;

    // Count active certificates
    const totalCertificates = await Certificate.countDocuments({ status: 'Active' });

    // 2. Chart 1: Registrations over time (Group by Year-Month)
    // Return last 12 months of student registration stats
    const registrationsOverTime = await Student.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    // Format chart data: [{ date: '2026-07', registrations: 5 }]
    const formattedRegistrations = registrationsOverTime.map(item => ({
      date: item._id,
      registrations: item.count
    })).reverse();

    // 3. Chart 2: Payments over time (Group by Year-Month)
    // Return last 12 months of payment stats
    const paymentsOverTime = await FeePayment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidOn' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    // Format chart data: [{ date: '2026-07', amount: 15000 }]
    const formattedPayments = paymentsOverTime.map(item => ({
      date: item._id,
      amount: item.amount
    })).reverse();

    res.json({
      cards: {
        totalStudents,
        totalCourses,
        totalRevenue,
        totalCertificates
      },
      charts: {
        registrations: formattedRegistrations,
        payments: formattedPayments
      }
    });

  } catch (err) {
    console.error('Dashboard aggregation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
