const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const samples = await db.collection('students').find({
    $or: [
      { name: /University/i },
      { name: /College/i },
      { name: /Polytechnic/i }
    ]
  }).limit(5).toArray();

  console.log("Colleges/Polytechnics in students collection:", JSON.stringify(samples, null, 2));

  await mongoose.disconnect();
}

check().catch(console.error);
