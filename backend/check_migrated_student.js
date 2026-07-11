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

  console.log("Finding a student with valid registration date...");
  let foundRegNo = null;
  let sqlDate = null;
  let sqlStartDate = null;
  
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
      
      if (columns.length >= 35) {
        const regNo = columns[1].replace(/'/g, '');
        const courseStartingDate = columns[24].replace(/'/g, '');
        const regDate = columns[34].replace(/'/g, '');
        
        if (regDate && !regDate.includes('0000-00-00') && regDate.startsWith('202')) {
          foundRegNo = regNo;
          sqlDate = regDate;
          sqlStartDate = courseStartingDate;
          break;
        }
      }
    }
  }

  if (foundRegNo) {
    console.log(`Found SQL Student: ${foundRegNo}, SQL Date: ${sqlDate}, SQL StartDate: ${sqlStartDate}`);
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const student = await db.collection('students').findOne({ registrationNo: foundRegNo });
    console.log("MongoDB record:", JSON.stringify(student, null, 2));
    await mongoose.disconnect();
  } else {
    console.log("No student found with valid date in SQL.");
  }
}

run().catch(console.error);
