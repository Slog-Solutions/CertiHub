const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Find all students ending in _dup1
  const dupStudents = await db.collection('students').find({ registrationNo: /_dup1$/ }).toArray();
  console.log(`Found ${dupStudents.length} duplicate (_dup1) students.`);

  let dummyCounter = 0;
  for (const dup of dupStudents.slice(0, 10)) {
    const baseRegNo = dup.registrationNo.replace('_dup1', '');
    const baseStudent = await db.collection('students').findOne({ registrationNo: baseRegNo });
    console.log(`\nDuplicate: ${dup.registrationNo} | Name: ${dup.name} | Email: ${dup.email} | Phone: ${dup.phone}`);
    if (baseStudent) {
      console.log(`Base:      ${baseStudent.registrationNo} | Name: ${baseStudent.name} | Email: ${baseStudent.email} | Phone: ${baseStudent.phone}`);
      // Check if base student has NA values
      const isDummy = baseStudent.email === 'NA' || baseStudent.phone === 'NA' || baseStudent.gender === 'NA';
      if (isDummy) {
        dummyCounter++;
      }
    } else {
      console.log(`Base student not found for ${baseRegNo}`);
    }
  }

  console.log(`\nOut of the first 10, ${dummyCounter} base students are dummy/empty.`);
  await mongoose.disconnect();
}

check().catch(console.error);
