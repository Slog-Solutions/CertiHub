const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const count = await db.collection('feepayments').countDocuments();
  console.log(`Total payments: ${count}`);

  const paidOnGroups = await db.collection('feepayments').aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$paidOn' } },
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log("paidOn grouping:");
  console.log(JSON.stringify(paidOnGroups, null, 2));

  await mongoose.disconnect();
}

check().catch(console.error);
