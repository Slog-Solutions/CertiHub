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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
app.use('/api/backup', require('./routes/backup').router);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));


// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
