const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./db');
const Student = require('./models/Student');
const College = require('./models/College');
const Branch = require('./models/Branch');
const CourseDetail = require('./models/CourseDetail');
const Technology = require('./models/Technology');
const Duration = require('./models/Duration');
const Certificate = require('./models/Certificate');
const CertificateTemplate = require('./models/CertificateTemplate');
const { generateCertificatePDF } = require('./utils/pdfGenerator');
const { runBackupExport } = require('./routes/backup');
const qrcode = require('qrcode');
const archiver = require('archiver');

const runVerification = async () => {
  console.log('Starting end-to-end integration tests...\n');
  
  // 1. Test database connection
  await connectDB();
  console.log('STEP 1: Database connection verified.');

  try {
    // Clean up any leftovers from previous crashed test runs
    await Student.deleteMany({ registrationNo: 'STP-TEST-REG-12345' });
    await Technology.deleteMany({ name: 'E2E Test Technology' });
    await Branch.deleteMany({ name: 'E2E Branch' });
    await College.deleteMany({ collegeName: 'Test College of Engineering' });
    await Certificate.deleteMany({ certificateId: 'CERT-TEST-999999' });
    await CertificateTemplate.deleteMany({ name: 'Verification Template' });

    // 2. Seed dummy records
    console.log('Seeding dummy records for test run...');
    const tech = new Technology({ name: 'E2E Test Technology', note: 'Test tech', isActive: true });
    await tech.save();
    
    const dur = new Duration({ value: 4, unit: 'week', note: 'Test duration', isActive: true });
    await dur.save();

    const branch = new Branch({ name: 'E2E Branch', note: 'Test branch', isActive: true });
    await branch.save();

    const college = new College({
      cityName: 'Test City',
      collegeName: 'Test College of Engineering',
      shortForm: 'TCE',
      logoImageUrl: '',
      isActive: true,
      showSignature: true
    });
    await college.save();

    const course = new CourseDetail({
      technologyId: tech._id,
      durationId: dur._id,
      price: 12000,
      isActive: true
    });
    await course.save();

    const student = new Student({
      registrationNo: 'STP-TEST-REG-12345',
      name: 'John Test Doe',
      fatherName: 'Richard Doe',
      dob: new Date('2000-01-01'),
      gender: 'Male',
      email: 'john.doe@test.com',
      phone: '9999988888',
      nationality: 'Indian',
      address: 'Test Street, Sector 5',
      workingStatus: 'student',
      collegeId: college._id,
      branchId: branch._id,
      courseDetailId: course._id,
      durationId: dur._id,
      startDate: new Date('2026-07-01'),
      totalFee: 12000,
      isActive: true
    });
    await student.save();

    const temp = new CertificateTemplate({
      name: 'Verification Template',
      htmlContent: '<h1>Test Template</h1>',
      isDefault: true
    });
    await temp.save();

    console.log('Dummy records seeded. Student RegNo:', student.registrationNo);

    // 3. Test QR and PDF Generator
    console.log('\nSTEP 2: Testing QR Code & Certificate PDF Generation...');
    const certId = 'CERT-TEST-999999';
    const qrData = await qrcode.toDataURL(`http://localhost:5173/verify/${certId}`);
    
    const outputDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${certId}.pdf`);

    await generateCertificatePDF(
      student,
      await course.populate(['technologyId', 'durationId']),
      certId,
      qrData,
      outputPath,
      new Date()
    );

    if (fs.existsSync(outputPath)) {
      console.log(`Success: PDF Certificate generated at: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
    } else {
      throw new Error('PDF Certificate file was not created');
    }

    // Save Certificate record
    const cert = new Certificate({
      certificateId: certId,
      studentId: student._id,
      courseDetailId: course._id,
      templateId: temp._id,
      pdfUrl: `/uploads/certificates/${certId}.pdf`,
      qrCodeUrl: qrData,
      issueDate: new Date(),
      status: 'Active'
    });
    await cert.save();

    // 4. Test ZIP archiving
    console.log('\nSTEP 3: Testing ZIP Archiving...');
    const zipPath = path.join(__dirname, `uploads/certificates/test-batch.zip`);
    const outputZipStream = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      outputZipStream.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(outputZipStream);
      archive.file(outputPath, { name: `${certId}.pdf` });
      archive.finalize();
    });

    if (fs.existsSync(zipPath)) {
      console.log(`Success: ZIP batch created at: ${zipPath} (${fs.statSync(zipPath).size} bytes)`);
      fs.unlinkSync(zipPath); // clean up zip
    } else {
      throw new Error('ZIP archive was not created');
    }

    // 5. Test JSON Backup
    console.log('\nSTEP 4: Testing JSON Database Backup...');
    const { fileName, filePath } = await runBackupExport();
    if (fs.existsSync(filePath)) {
      console.log(`Success: Database dump created at: ${filePath} (${fs.statSync(filePath).size} bytes)`);
      fs.unlinkSync(filePath); // clean up backup file
    } else {
      throw new Error('JSON backup export file was not created');
    }

    // 6. Cleanup seeded records
    console.log('\nCleaning up seeded database records...');
    await Student.findByIdAndDelete(student._id);
    await College.findByIdAndDelete(college._id);
    await Branch.findByIdAndDelete(branch._id);
    await CourseDetail.findByIdAndDelete(course._id);
    await Technology.findByIdAndDelete(tech._id);
    await Duration.findByIdAndDelete(dur._id);
    await Certificate.findByIdAndDelete(cert._id);
    await CertificateTemplate.findByIdAndDelete(temp._id);

    // Delete generated PDF
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    console.log('\n=========================================');
    console.log('INTEGRATION TEST VERIFICATION SUCCESSFUL!');
    console.log('All schemas, PDF generation, ZIP archiving, and backups functional.');
    console.log('=========================================\n');
    process.exit(0);

  } catch (err) {
    console.error('\nVERIFICATION ERROR:', err.message);
    process.exit(1);
  }
};

runVerification();
