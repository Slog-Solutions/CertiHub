const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const coll of collections) {
    const name = coll.name;
    const count = await db.collection(name).countDocuments();
    console.log(`Collection: ${name}, Count: ${count}`);
    if (count > 0) {
      const samples = await db.collection(name).find().limit(3).toArray();
      console.log(`Samples for ${name}:`, JSON.stringify(samples, null, 2));
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
