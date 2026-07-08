const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function inspect() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const StudentCollection = db.collection('students');

  const students = await StudentCollection.find({
    createdAt: { $gt: new Date('2026-07-03'), $lt: new Date('2026-07-05') }
  }).toArray();

  console.log(`Remaining July 2026 students count: ${students.length}`);
  
  const formats = {};
  for (const s of students) {
    const regNo = s.registrationNo;
    const format = regNo.replace(/\d+/g, 'N');
    formats[format] = (formats[format] || 0) + 1;
    if (formats[format] <= 3) {
      console.log(`Example for format '${format}': ${regNo}`);
    }
  }

  console.log("\nFormat distribution:");
  console.log(formats);

  await mongoose.disconnect();
}

inspect().catch(console.error);
