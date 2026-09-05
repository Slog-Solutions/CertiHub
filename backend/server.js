// Slog Solutions server bootstrapper (restarted - trigger)
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

// Trust reverse proxy (Nginx / Cloudflare / PM2) for IP rate-limiting
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:9002',
  'https://smp.slogsolutions.com',
  'http://smp.slogsolutions.com',
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
const pdfsDir = path.join(uploadsRoot, 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}
// Lazy PDF generation fallback for certificates
app.get('/uploads/certificates/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.pdf')) {
    return next();
  }

  const pdfPath = path.join(__dirname, 'uploads/certificates', filename);
  if (fs.existsSync(pdfPath)) {
    return res.sendFile(pdfPath);
  }

  const certificateId = filename.slice(0, -4); // Remove .pdf

  try {
    const Certificate = require('./models/Certificate');
    const cert = await Certificate.findOne({ certificateId });
    if (!cert) {
      return res.status(404).send('Certificate record not found');
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
    res.status(500).send('Error generating certificate PDF: ' + error.message);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB().then(() => {
  // Seed admin user
  seedAdmin();
  
  // Seed initial mentors if empty
  seedMentors();
  
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

// Seed initial mentors logic
const seedMentors = async () => {
  const Mentor = require('./models/Mentor');
  try {
    const count = await Mentor.countDocuments();
    if (count === 0) {
      const initialMentors = [
        { name: "Er. Narendra Kumar Yadav", designation: "Ex. Chairman IEI-UKSC Dehradun, FIE, IITR", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_2_qr9lpi", sortOrder: 0 },
        { name: "Er. Prashant Kumar", designation: "Director, IEI-UKSC Civil Engineering Laboratory", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_nxs313", sortOrder: 1 },
        { name: "Er. Suraj Singh", designation: "Director", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/suraj_ga3mmj", sortOrder: 2 },
        { name: "Er. Kiran Bisht", designation: "Director", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/1730734550846_yxkdgm", sortOrder: 3 },
        { name: "Er. Chandra Prakash Sharma", designation: "FIE (INDIA), Chairman   IEI-UKSC, Dehradun", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_4.48.12_PM_ofdbb5", sortOrder: 4 },
        { name: "Mrs. Neeraja  Sisodia", designation: "Outbound Training, Soft Skill and Personality Development Expert", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.43_PM_1_rsgsr6", sortOrder: 5 },
        { name: "Er. Himanshu Awasthi", designation: "FIE, Honorary Secretary IEI-UKSC, Dehradun", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_4.48.13_PM_ofvn6j", sortOrder: 6 },
        { name: "Brigadier Govind  Singh  Sisodia (Retired)", designation: "Outbound Training Expert", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.42_PM_sfgnu0", sortOrder: 7 },
        { name: "Er. Sarthak Aggarwal", designation: "Software Developer Engineer  (Team Lead)", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-19_at_10.05.02_AM_kerlox", sortOrder: 8 },
        { name: "Er.  Pinki Negi", designation: "Branch  Coordinator", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.57.41_AM_avzdsq", sortOrder: 9 },
        { name: "Mr. Om Mehta", designation: "Center Manager", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-01_at_5.04.29_PM_ea2dfv", sortOrder: 10 },
        { name: "Er. Mahadeep Chauhan", designation: "IOT, Drone, PLC Expert", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.57.51_AM_gwpsmu", sortOrder: 11 },
        { name: "Er. Laksh Rajkumar", designation: "Software Development Engineer - II", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.59.43_PM_imxglb", sortOrder: 12 },
        { name: "Er. Atul Thakur", designation: "Cyber Security, CCNA and Networking", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/07128134-1163-45ca-a4dc-0294c72d30d8_lsp6ia", sortOrder: 13 },
        { name: "Er. Vinayak  Gupta", designation: "CAD Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.44_PM_gjse1b", sortOrder: 14 },
        { name: "Er. Adarsh Kumar", designation: "Web Developer Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_1.48.43_PM_yudqsh", sortOrder: 15 },
        { name: "Er. Jayesh Suntha", designation: "Software Developer  Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2025-09-27_at_1.21.44_PM_1_i659p2", sortOrder: 16 },
        { name: "Er. Mohit Rawat", designation: "Android App Developer & IOT", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/me_profile_1_lxblam", sortOrder: 17 },
        { name: "Er. Vansh  Gupta", designation: "Software Development Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-23_at_11.51.31_AM_schaxn", sortOrder: 18 },
        { name: "Er. Harshit Bhatnagar", designation: "AI/ML  Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-22_at_4.43.53_PM_oc4iv2", sortOrder: 19 },
        { name: "Mr. Rajesh  Pundir", designation: "Business Development Executive", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-01-21_at_11.02.26_AM_loloi0", sortOrder: 20 },
        { name: "Er. Shubham Singh", designation: "Full Stack Developer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/Confident_professional_headshot_in_navy_suit_woewjk", sortOrder: 21 },
        { name: "Er. Sumit Singh", designation: "Application Developer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/Picsart_26-03-25_16-51-45-336_1_awj45w", sortOrder: 22 },
        { name: "Er. Harshit Waldia", designation: "AI/ML  Engineer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-03-25_at_4.22.05_PM_ngwnvn", sortOrder: 23 },
        { name: "Er. Keshav Maheshwari", designation: "Data Analytics Intern", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/file_0000000000ac71fab6d1fc329227bbe9_1_dnus1i", sortOrder: 24 },
        { name: "Er. Aryan Kashyap", designation: "Data Scientist Intern", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/1774269321309_f7g6t1", sortOrder: 25 },
        { name: "Miss Shivangi Chandel", designation: "HR", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-03-28_at_4.54.46_PM_ouleg3", sortOrder: 26 },
        { name: "Er. Sajal Singh", designation: "Cybersecurity and Networking", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-04_at_5.04.50_PM_u8mf5x", sortOrder: 27 },
        { name: "Er. Sachin Singh", designation: "Full Stack Developer Intern", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/7768803e-6657-4f94-afac-1afa5c2d1929_mas0tr", sortOrder: 28 },
        { name: "Er. Himanshu Panwar", designation: "Full Stack Developer Intern", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-04-06_at_5.24.28_PM_yq17me", sortOrder: 29 },
        { name: "Er. Sahil Negi", designation: "AI/ML  Developer", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-05-14_at_10.53.48_AM_haldr9", sortOrder: 30 },
        { name: "Er. Ayush Kulhari", designation: "Cyber Security", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/IMG_3593_sasvrp", sortOrder: 31 },
        { name: "Miss Srishty", designation: "HR Intern", image: "https://res.cloudinary.com/dfyyhjder/image/upload/v1/media/mentors/WhatsApp_Image_2026-05-14_at_11.02.49_AM_j5d6vg", sortOrder: 32 }
      ];
      await Mentor.insertMany(initialMentors);
      console.log('SEED: Initial 33 Mentors Seeded Successfully!');
    }
  } catch (err) {
    console.error('Failed to seed mentors:', err.message);
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
app.use('/api/batches', require('./routes/batches'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/custom-courses', require('./routes/customCourses'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/push', require('./routes/push'));

// Dummy endpoints for frontend CMS components to prevent 404 console errors
app.use('/api/hero-slides', (req, res) => res.json([]));
app.use('/api/products', (req, res) => res.json([]));
app.use('/api/mentors', require('./routes/mentors'));

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
  app.get(['/dashboard*', '/mentors*'], (req, res) => {
    const dashboardHtml = path.resolve(__dirname, '../frontend/out/dashboard.html');
    const dashboardIndex = path.resolve(__dirname, '../frontend/out/dashboard/index.html');
    if (fs.existsSync(dashboardHtml)) {
      res.sendFile(dashboardHtml);
    } else {
      res.sendFile(dashboardIndex);
    }
  });

  // Route /user* to Next.js user SPA page
  app.get('/user*', (req, res) => {
    const userHtml = path.resolve(__dirname, '../frontend/out/user.html');
    const userIndex = path.resolve(__dirname, '../frontend/out/user/index.html');
    if (fs.existsSync(userHtml)) {
      res.sendFile(userHtml);
    } else {
      res.sendFile(userIndex);
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
