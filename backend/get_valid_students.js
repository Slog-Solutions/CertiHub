const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions';

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching for a student with valid dates...");
  let foundRow = null;

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO `tbl_registration`')) {
      const valuesPart = line.substring(line.indexOf('VALUES') + 6);
      const rows = valuesPart.split(/\),\s*\(/);
      for (const r of rows) {
        if (!r.includes("'0000-00-00 00:00:00'") && !r.includes("'0000-00-00'")) {
          console.log("Found SQL row snippet:", r.substring(0, 400) + "...");
          // In tbl_registration columns are:
          // student_id, registration_id (col 2), first_name, last_name, father_name, dob, nationality, gender, work_status, address, email, alt_email, number, home_number, branch, college_year, college, state, city, training, course, duration, training_city, training_clg, course_starting_date, course_price, fee_type, fee, fee_gst, paymethod, discount, feesubmitdate, declare, user_image, date, status, issue_id, issue_certificate
          // Let's find the registration_id which is the 2nd value.
          // Since values can have quotes, let's parse using a basic tokenizer or match.
          // Let's just find the first single-quoted string that isn't the table name.
          // The second field is registrationNo. Let's find it.
          const matches = r.match(/'([^']+)'/g);
          if (matches && matches.length >= 1) {
            const regNo = matches[0].replace(/'/g, '');
            foundRow = {
              regNo: regNo,
              sqlRow: r
            };
            break;
          }
        }
      }
    }
    if (foundRow) break;
  }

  if (foundRow) {
    console.log(`Connecting to MongoDB to check student: ${foundRow.regNo}...`);
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const student = await db.collection('students').findOne({ registrationNo: foundRow.regNo });
    console.log("MongoDB student record:", JSON.stringify(student, null, 2));
    await mongoose.disconnect();
  } else {
    console.log("No student with completely valid dates found in the dump.");
  }
}

scan().catch(console.error);
