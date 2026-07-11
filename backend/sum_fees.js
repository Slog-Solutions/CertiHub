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

  let totalRegFee = 0;
  let totalResponseFee = 0;
  let successResponseFee = 0;
  
  let insideRegistration = false;
  let insideResponse = false;
  
  for await (const line of rl) {
    // Check registration table
    if (line.startsWith('INSERT INTO `tbl_registration`')) {
      insideRegistration = true;
      continue;
    }
    if (insideRegistration) {
      if (line.startsWith('INSERT INTO') || line.startsWith('--') || line.trim() === '') {
        insideRegistration = false;
        continue;
      }
      const columns = line.split(/,\s*/); // Simple approximation
      // In tbl_registration, columns[27] is fee
      // Let's parse columns properly by matching quotes
      const parsedCols = [];
      let current = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          parsedCols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parsedCols.push(current.trim());
      
      if (parsedCols.length >= 28) {
        const feeVal = parseFloat(parsedCols[27]);
        if (!isNaN(feeVal)) {
          totalRegFee += feeVal;
        }
      }
    }
    
    // Check response table
    if (line.startsWith('INSERT INTO `response`')) {
      insideResponse = true;
      continue;
    }
    if (insideResponse) {
      if (line.startsWith('INSERT INTO') || line.startsWith('--') || line.trim() === '') {
        insideResponse = false;
        continue;
      }
      
      const parsedCols = [];
      let current = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          parsedCols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parsedCols.push(current.trim());
      
      if (parsedCols.length >= 10) {
        const amountVal = parseFloat(parsedCols[5].replace(/'/g, ''));
        const statusVal = parsedCols[9].replace(/'/g, '');
        if (!isNaN(amountVal)) {
          totalResponseFee += amountVal;
          if (statusVal === '1' || statusVal === 'SUCCESS' || statusVal === 'offline') {
            successResponseFee += amountVal;
          }
        }
      }
    }
  }

  console.log(`Sum of fee in tbl_registration: ${totalRegFee}`);
  console.log(`Sum of amount in response: ${totalResponseFee}`);
  console.log(`Sum of successful amount in response: ${successResponseFee}`);

  // Query MongoDB
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const paymentSumResult = await db.collection('feepayments').aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();
  const totalRevenueMongo = paymentSumResult.length > 0 ? paymentSumResult[0].total : 0;
  console.log(`Sum of feepayments in MongoDB: ${totalRevenueMongo}`);
  await mongoose.disconnect();
}

scan().catch(console.error);
