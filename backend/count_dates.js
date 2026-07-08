const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Analyzing registration dates...");
  let totalRows = 0;
  let validDateCount = 0;
  let validStartingDateCount = 0;
  let validFeeSubmitDateCount = 0;
  
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
      
      totalRows++;
      
      // Parse the CSV-like row in parentheses. Since it's SQL values, we can split by comma.
      // A simple regex split or parsing can work. Let's do a basic split by comma, ignoring commas inside quotes.
      // For estimation, let's just use string inspection.
      // Columns index (1-based from creation):
      // 25. course_starting_date
      // 32. feesubmitdate
      // 35. date (timestamp)
      
      // If we split by ',' we can approximate the columns.
      // But we can also just check if the string contains certain patterns.
      // Let's count how many times they contain things other than '0000-00-00'
      
      // Let's parse columns properly by splitting on commas not inside single quotes
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
      
      // The first value starts with '(' and the last value ends with '),' or ');'
      if (columns.length >= 35) {
        const courseStartingDate = columns[24]; // 25th column (0-indexed 24)
        const feeSubmitDate = columns[31]; // 32nd column (0-indexed 31)
        const regDate = columns[34]; // 35th column (0-indexed 34)
        
        if (courseStartingDate && !courseStartingDate.includes('0000-00-00')) {
          validStartingDateCount++;
        }
        if (feeSubmitDate && !feeSubmitDate.includes('0000-00-00')) {
          validFeeSubmitDateCount++;
        }
        if (regDate && !regDate.includes('0000-00-00')) {
          validDateCount++;
        }
      }
    }
  }
  
  console.log(`Total rows processed in tbl_registration: ${totalRows}`);
  console.log(`Rows with valid course_starting_date: ${validStartingDateCount}`);
  console.log(`Rows with valid feesubmitdate: ${validFeeSubmitDateCount}`);
  console.log(`Rows with valid date (creation timestamp): ${validDateCount}`);
}

scan().catch(console.error);
