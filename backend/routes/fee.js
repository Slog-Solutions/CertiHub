const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const FeePayment = require('../models/FeePayment');
const FeeDiscount = require('../models/FeeDiscount');
const CourseDetail = require('../models/CourseDetail');
const { requireAuth } = require('../middleware/auth');

// Apply Auth protection
router.use(requireAuth);

/* ==========================================
   1. STUDENT FEE LIST & AGGREGATION
   ========================================== */

// @route   GET /api/fee/students
// @desc    Get students with fee details (aggregated Submitted Fee, Discount, Remaining)
// @access  Private (Admin & Staff)
router.get('/students', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { registrationNo: searchRegex }
    ];
  }

  try {
    // 1. Fetch matching student IDs (applying search & status filters)
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const matchedStudents = await Student.find(filter).select('_id');
    const studentIds = matchedStudents.map(s => s._id);

    // 2. Perform Mongoose aggregation to sum payments and attach discounts
    const aggregatedFees = await Student.aggregate([
      { $match: { _id: { $in: studentIds } } },
      // Look up discounts
      {
        $lookup: {
          from: 'feediscounts',
          localField: '_id',
          foreignField: 'studentId',
          as: 'discountInfo'
        }
      },
      { $unwind: { path: '$discountInfo', preserveNullAndEmptyArrays: true } },
      // Look up payments
      {
        $lookup: {
          from: 'feepayments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'paymentsInfo'
        }
      },
      // Lookup college info
      {
        $lookup: {
          from: 'colleges',
          localField: 'collegeId',
          foreignField: '_id',
          as: 'college'
        }
      },
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      // Lookup course detail (populated with technology & duration)
      {
        $lookup: {
          from: 'coursedetails',
          localField: 'courseDetailId',
          foreignField: '_id',
          as: 'courseDetail'
        }
      },
      { $unwind: { path: '$courseDetail', preserveNullAndEmptyArrays: true } },
      // Add projects to compute total payments
      {
        $project: {
          registrationNo: 1,
          name: 1,
          totalFee: 1,
          isActive: 1,
          college: '$college.collegeName',
          courseDetail: 1,
          discountAmount: { $ifNull: ['$discountInfo.discountAmount', 0] },
          totalToPay: { $ifNull: ['$discountInfo.totalToPay', '$totalFee'] },
          submittedFee: { $sum: '$paymentsInfo.amount' },
          createdAt: 1
        }
      },
      {
        $project: {
          registrationNo: 1,
          name: 1,
          totalFee: 1,
          isActive: 1,
          college: 1,
          courseDetail: 1,
          discountAmount: 1,
          totalToPay: 1,
          submittedFee: 1,
          remainingFee: { $subtract: ['$totalToPay', '$submittedFee'] },
          paymentStatus: {
            $cond: {
              if: { $gte: ['$submittedFee', '$totalToPay'] },
              then: 'Fully Paid',
              else: 'Pending'
            }
          },
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Populate course details technology & duration details manually (since $lookup nested is verbose)
    for (let agg of aggregatedFees) {
      if (agg.courseDetail) {
        const fullDetail = await CourseDetail.findById(agg.courseDetail._id)
          .populate('technologyId')
          .populate('durationId');
        if (fullDetail) {
          agg.courseName = fullDetail.technologyId ? fullDetail.technologyId.name : 'Unknown';
          agg.duration = fullDetail.durationId ? `${fullDetail.durationId.value} ${fullDetail.durationId.unit}(s)` : 'Unknown';
        }
      }
    }

    const total = await Student.countDocuments(filter);

    res.json({
      data: aggregatedFees,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   2. FEE INSTALLMENT CRUD
   ========================================== */

// @route   GET /api/fee/installments/:studentId
// @desc    Get running installment logs for a student
// @access  Private (Admin & Staff)
router.get('/installments/:studentId', async (req, res) => {
  try {
    const installments = await FeePayment.find({ studentId: req.params.studentId }).sort({ paidOn: 1 });
    res.json(installments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/fee/installments
// @desc    Add a fee installment payment
// @access  Private (Admin & Staff)
router.post('/installments', async (req, res) => {
  const { studentId, registrationNo, amount, paymentType, paidOn } = req.body;

  try {
    let student = null;
    if (studentId) {
      student = await Student.findById(studentId);
    } else if (registrationNo) {
      student = await Student.findOne({ registrationNo });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student registration record not found' });
    }

    const payment = new FeePayment({
      studentId: student._id,
      amount: parseFloat(amount),
      paymentType,
      paidOn: paidOn ? new Date(paidOn) : new Date()
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/fee/installments/:id
// @desc    Edit a fee installment payment
// @access  Private (Admin & Staff)
router.put('/installments/:id', async (req, res) => {
  const { amount, paymentType, paidOn } = req.body;
  try {
    const payment = await FeePayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Installment payment not found' });
    }

    if (amount !== undefined) payment.amount = parseFloat(amount);
    if (paymentType) payment.paymentType = paymentType;
    if (paidOn) payment.paidOn = new Date(paidOn);

    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/fee/installments/:id
// @desc    Delete a fee installment payment
// @access  Private (Admin & Staff)
router.delete('/installments/:id', async (req, res) => {
  try {
    const payment = await FeePayment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Installment payment not found' });
    }
    res.json({ message: 'Installment payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   3. FEE DISCOUNT CRUD
   ========================================== */

// @route   GET /api/fee/discounts
// @desc    Get all students' discounts
// @access  Private (Admin & Staff)
router.get('/discounts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { registrationNo: searchRegex }
    ];
  }

  try {
    const students = await Student.find(filter).select('_id');
    const studentIds = students.map(s => s._id);

    const total = await FeeDiscount.countDocuments({ studentId: { $in: studentIds } });
    const discounts = await FeeDiscount.find({ studentId: { $in: studentIds } })
      .populate({
        path: 'studentId',
        select: 'name registrationNo courseDetailId durationId totalFee',
        populate: [
          {
            path: 'courseDetailId',
            populate: { path: 'technologyId' }
          },
          {
            path: 'durationId'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: discounts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/fee/discounts
// @desc    Add or update a discount for a student
// @access  Private (Admin & Staff)
router.post('/discounts', async (req, res) => {
  const { registrationNo, discountAmount } = req.body;

  if (!registrationNo || discountAmount === undefined) {
    return res.status(400).json({ error: 'Registration number and discount amount are required' });
  }

  try {
    const student = await Student.findOne({ registrationNo });
    if (!student) {
      return res.status(404).json({ error: 'Student registration record not found' });
    }

    const discountVal = parseFloat(discountAmount);
    if (discountVal < 0 || discountVal > student.totalFee) {
      return res.status(400).json({ error: 'Discount amount cannot be negative or exceed the total fee' });
    }

    const totalToPay = student.totalFee - discountVal;

    let discount = await FeeDiscount.findOne({ studentId: student._id });
    if (discount) {
      discount.discountAmount = discountVal;
      discount.totalToPay = totalToPay;
      await discount.save();
    } else {
      discount = new FeeDiscount({
        studentId: student._id,
        totalFee: student.totalFee,
        discountAmount: discountVal,
        totalToPay
      });
      await discount.save();
    }

    res.status(200).json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/fee/discounts/:id
// @desc    Update discount details
// @access  Private (Admin & Staff)
router.put('/discounts/:id', async (req, res) => {
  const { discountAmount } = req.body;

  if (discountAmount === undefined) {
    return res.status(400).json({ error: 'Discount amount is required' });
  }

  try {
    const discount = await FeeDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount record not found' });
    }

    const discountVal = parseFloat(discountAmount);
    if (discountVal < 0 || discountVal > discount.totalFee) {
      return res.status(400).json({ error: 'Discount amount cannot be negative or exceed the total fee' });
    }

    discount.discountAmount = discountVal;
    discount.totalToPay = discount.totalFee - discountVal;

    await discount.save();
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/fee/discounts/:id
// @desc    Delete/reset a discount for a student
// @access  Private (Admin & Staff)
router.delete('/discounts/:id', async (req, res) => {
  try {
    const discount = await FeeDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount record not found' });
    }

    // Reset discount parameters instead of deleting the schema to preserve reference
    discount.discountAmount = 0;
    discount.totalToPay = discount.totalFee;
    await discount.save();

    res.json({ message: 'Discount reset to zero successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
