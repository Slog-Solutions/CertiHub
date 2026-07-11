const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const count = await db.collection('students').countDocuments();
  console.log(`Total students: ${count}`);

  const sample = await db.collection('students').findOne();
  console.log("Sample Student:", JSON.stringify(sample, null, 2));

  // Find min/max values of createdAt
  const stats = await db.collection('students').aggregate([
    {
      $group: {
        _id: null,
        minCreatedAt: { $min: "$createdAt" },
        maxCreatedAt: { $max: "$createdAt" },
        minStartDate: { $min: "$startDate" },
        maxStartDate: { $max: "$startDate" }
      }
    }
  ]).toArray();

  console.log("Date statistics for students:", JSON.stringify(stats, null, 2));

  // Let's also check unique years or dates in createdAt and startDate
  const createdAtGroups = await db.collection('students').aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log("createdAt grouping:", createdAtGroups);

  const startDateGroups = await db.collection('students').aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log("startDate grouping:", startDateGroups);

  await mongoose.disconnect();
}

check().catch(console.error);
