// Slog Solutions server bootstrapper (restarted)
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./db');
const initBackupScheduler = require('./utils/backupScheduler');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:9002',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow any local host development origin
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload folders exist
const uploadsRoot = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lazy PDF generation fallback for certificates
app.get('/uploads/certificates/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.pdf')) {
    return next();
  }

  const certificateId = filename.slice(0, -4); // Remove .pdf

  try {
    const Certificate = require('./models/Certificate');
    const cert = await Certificate.findOne({ certificateId });
    if (!cert) {
      return next(); // Fall through to 404 or other static paths if not in DB
    }

    const Student = require('./models/Student');
    const CourseDetail = require('./models/CourseDetail');
    
    const student = await Student.findById(cert.studentId)
      .populate('collegeId')
      .populate('branchId');
      
    const courseDetail = await CourseDetail.findById(cert.courseDetailId)
      .populate('technologyId')
      .populate('durationId');

    if (!student || !courseDetail) {
      return res.status(404).send('Student or course details not found');
    }

    const { generateCertificatePDF } = require('./utils/pdfGenerator');
    const pdfPath = path.join(__dirname, 'uploads/certificates', filename);

    // Ensure certsDir exists
    const certsDir = path.dirname(pdfPath);
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    console.log(`Lazy generating certificate PDF for: ${certificateId}`);
    await generateCertificatePDF(
      student,
      courseDetail,
      certificateId,
      cert.qrCodeUrl,
      pdfPath,
      cert.issueDate
    );

    res.sendFile(pdfPath);
  } catch (error) {
    console.error('Lazy PDF generation failed:', error);
    res.status(500).send('Error generating certificate PDF');
  }
});

// Connect to MongoDB
connectDB().then(() => {
  // Seed admin user
  seedAdmin();
  
  // Start backup cron scheduler
  initBackupScheduler();
});

// Seed admin user logic
const seedAdmin = async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const adminCount = await User.countDocuments({ role: 'Admin' });
    if (adminCount === 0) {
      // Generate a strong default password
      const password = 'Admin@' + Math.random().toString(36).substring(2, 10);
      const passwordHash = await bcrypt.hash(password, 10);
      
      const defaultAdmin = new User({
        username: 'admin',
        passwordHash,
        name: 'System Administrator',
        email: 'admin@slogsolutions.com',
        mobile: '9999999999',
        address: 'Main Tech Block, Slog Solutions Campus',
        role: 'Admin',
        isActive: true
      });
      
      await defaultAdmin.save();
      
      console.log('\n=========================================');
      console.log('SEED: Default Admin Account Seeded!');
      console.log('Username: admin');
      console.log(`Password: ${password}`);
      console.log('PLEASE SAVE AND RECORD THESE CREDENTIALS.');
      console.log('=========================================\n');
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err.message);
  }
};

// Route Mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/masters', require('./routes/masters'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/fee', require('./routes/fee'));
app.use('/api/enquiry', require('./routes/enquiry'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/backup', require('./routes/backup').router);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));

// Dummy endpoints for frontend CMS components to prevent 404 console errors
app.use('/api/hero-slides', (req, res) => res.json([]));
app.use('/api/products', (req, res) => res.json([]));
app.use('/api/mentors', (req, res) => res.json([]));

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Serve Next.js static files
  app.use(express.static(path.join(__dirname, '../frontend/out')));

  // Route /login to Next.js login page
  app.get('/login', (req, res) => {
    const loginHtml = path.resolve(__dirname, '../frontend/out/login.html');
    const loginIndex = path.resolve(__dirname, '../frontend/out/login/index.html');
    if (fs.existsSync(loginHtml)) {
      res.sendFile(loginHtml);
    } else {
      res.sendFile(loginIndex);
    }
  });

  // Route /dashboard* to Next.js dashboard SPA page
  app.get('/dashboard*', (req, res) => {
    const dashboardHtml = path.resolve(__dirname, '../frontend/out/dashboard.html');
    const dashboardIndex = path.resolve(__dirname, '../frontend/out/dashboard/index.html');
    if (fs.existsSync(dashboardHtml)) {
      res.sendFile(dashboardHtml);
    } else {
      res.sendFile(dashboardIndex);
    }
  });

  // Serve Next.js verification fallback (e.g. /verify/STP-XXXX) to the verify index page so client JS can hydrate
  app.get('/verify/*', (req, res) => {
    const verifyHtml = path.resolve(__dirname, '../frontend/out/verify.html');
    const verifyIndex = path.resolve(__dirname, '../frontend/out/verify/index.html');
    if (fs.existsSync(verifyHtml)) {
      res.sendFile(verifyHtml);
    } else {
      res.sendFile(verifyIndex);
    }
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/out/index.html'));
  });
} else {
  // Test root route
  app.get('/', (req, res) => {
    res.send('Slog Solutions Backend API is Running...');
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
