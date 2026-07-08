const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const student = await db.collection('students').findOne({ registrationNo: 'STP-2022-08-19-1-09475' });
  if (student) {
    console.log("Student:", JSON.stringify(student, null, 2));
    const payments = await db.collection('feepayments').find({ studentId: student._id }).toArray();
    console.log("Payments:", JSON.stringify(payments, null, 2));
    
    const discounts = await db.collection('feediscounts').find({ studentId: student._id }).toArray();
    console.log("Discounts:", JSON.stringify(discounts, null, 2));
  } else {
    console.log("Student not found");
  }

  await mongoose.disconnect();
}

check().catch(console.error);
