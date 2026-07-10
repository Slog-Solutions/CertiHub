const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const FeePayment = require('../models/FeePayment');
const CourseDetail = require('../models/CourseDetail');
const { requireAuth } = require('../middleware/auth');

// Require authentication for all reports endpoints
router.use(requireAuth);

// 1. Fee Collection Report
// GET /api/reports/fee-collection
router.get('/fee-collection', async (req, res) => {
  try {
    const { paymentType } = req.query;
    let query = {};

    if (paymentType && paymentType !== 'all') {
      query.paymentType = paymentType;
    }

    const payments = await FeePayment.find(query)
      .populate({
        path: 'studentId',
        select: 'name registrationNo totalFee'
      })
      .sort({ paidOn: -1 });

    const FeeDiscount = require('../models/FeeDiscount');
    const paymentsWithDetails = await Promise.all(payments.map(async (payment) => {
      let discountAmount = 0;
      let totalToPay = payment.studentId ? payment.studentId.totalFee : 0;
      
      if (payment.studentId) {
        const discount = await FeeDiscount.findOne({ studentId: payment.studentId._id });
        if (discount) {
          discountAmount = discount.discountAmount;
          totalToPay = discount.totalToPay;
        }
      }
      
      return {
        _id: payment._id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paidOn: payment.paidOn,
        studentId: payment.studentId ? {
          _id: payment.studentId._id,
          name: payment.studentId.name,
          registrationNo: payment.studentId.registrationNo,
          totalFee: payment.studentId.totalFee
        } : null,
        discountAmount,
        totalToPay
      };
    }));

    res.json(paymentsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Date-wise Fee Collection Report
// GET /api/reports/date-wise-fee
router.get('/date-wise-fee', async (req, res) => {
  try {
    const { startDate, endDate, paymentType } = req.query;
    let query = {};

    if (paymentType && paymentType !== 'all') {
      query.paymentType = paymentType;
    }

    if (startDate || endDate) {
      query.paidOn = {};
      if (startDate) {
        query.paidOn.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paidOn.$lte = end;
      }
    }

    const payments = await FeePayment.find(query)
      .populate({
        path: 'studentId',
        select: 'name registrationNo totalFee'
      })
      .sort({ paidOn: -1 });

    const FeeDiscount = require('../models/FeeDiscount');
    const paymentsWithDetails = await Promise.all(payments.map(async (payment) => {
      let discountAmount = 0;
      let totalToPay = payment.studentId ? payment.studentId.totalFee : 0;
      
      if (payment.studentId) {
        const discount = await FeeDiscount.findOne({ studentId: payment.studentId._id });
        if (discount) {
          discountAmount = discount.discountAmount;
          totalToPay = discount.totalToPay;
        }
      }
      
      return {
        _id: payment._id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paidOn: payment.paidOn,
        studentId: payment.studentId ? {
          _id: payment.studentId._id,
          name: payment.studentId.name,
          registrationNo: payment.studentId.registrationNo,
          totalFee: payment.studentId.totalFee
        } : null,
        discountAmount,
        totalToPay
      };
    }));

    res.json(paymentsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Course Report
// GET /api/reports/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await CourseDetail.find({})
      .populate('technologyId')
      .populate('durationId')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Course-wise Total Student Report
// GET /api/reports/course-students
router.get('/course-students', async (req, res) => {
  try {
    // Aggregate student counts by courseDetailId
    const aggregation = await Student.aggregate([
      {
        $group: {
          _id: '$courseDetailId',
          studentCount: { $sum: 1 }
        }
      }
    ]);

    // Populate course details for the response
    const reports = [];
    for (const group of aggregation) {
      if (group._id) {
        const course = await CourseDetail.findById(group._id)
          .populate('technologyId')
          .populate('durationId');
        if (course) {
          reports.push({
            courseId: course._id,
            courseName: course.technologyId ? course.technologyId.name : 'Unknown',
            duration: course.durationId ? `${course.durationId.value} ${course.durationId.unit}(s)` : 'Unknown',
            price: course.price,
            studentCount: group.studentCount
          });
        }
      }
    }

    // Include courses that have 0 students enrolled
    const allCourses = await CourseDetail.find({})
      .populate('technologyId')
      .populate('durationId');

    for (const course of allCourses) {
      const exists = reports.some(r => r.courseId.toString() === course._id.toString());
      if (!exists) {
        reports.push({
          courseId: course._id,
          courseName: course.technologyId ? course.technologyId.name : 'Unknown',
          duration: course.durationId ? `${course.durationId.value} ${course.durationId.unit}(s)` : 'Unknown',
          price: course.price,
          studentCount: 0
        });
      }
    }

    // Sort alphabetically by course name
    reports.sort((a, b) => a.courseName.localeCompare(b.courseName));

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
