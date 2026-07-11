const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function run() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Reading registration_ids from SQL...");
  const sqlRegNos = new Set();
  let insideRegistration = false;
  
  for await (const line of rl) {
    if (line.startsWith('INSERT INTO `tbl_registration`')) {
      insideRegistration = true;
      continue;
    }
    if (insideRegistration) {
      if (line.startsWith('INSERT INTO') || line.startsWith('--') || line.trim() === '') {
        insideRegistration = false;
        continue;
      }
      
      const columns = [];
      let current = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim());
      
      if (columns.length >= 2) {
        const regNo = columns[1].replace(/'/g, '');
        sqlRegNos.add(regNo);
      }
    }
  }

  console.log(`Unique registration_ids in SQL: ${sqlRegNos.size}`);

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const mongoStudents = await db.collection('students').find({}, { projection: { registrationNo: 1, name: 1, createdAt: 1 } }).toArray();
  console.log(`Total students in MongoDB: ${mongoStudents.length}`);

  const extraStudents = [];
  for (const student of mongoStudents) {
    if (!sqlRegNos.has(student.registrationNo)) {
      extraStudents.push(student);
    }
  }

  console.log(`Extra students in MongoDB (not in SQL): ${extraStudents.length}`);
  if (extraStudents.length > 0) {
    console.log("First 10 extra students:", JSON.stringify(extraStudents.slice(0, 10), null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
