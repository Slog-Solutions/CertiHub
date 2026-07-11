const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Extracting distinct date distributions from tbl_registration...");
  const registrationDates = {};
  const feeSubmitDates = {};
  
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
        // Column 35 is date (timestamp)
        const dateVal = columns[34].replace(/'/g, '');
        const feeSubmitVal = columns[31].replace(/'/g, '');
        
        if (dateVal && !dateVal.includes('0000-00-00')) {
          const ymd = dateVal.substring(0, 10);
          registrationDates[ymd] = (registrationDates[ymd] || 0) + 1;
        }
        if (feeSubmitVal && !feeSubmitVal.includes('0000-00-00')) {
          feeSubmitDates[feeSubmitVal] = (feeSubmitDates[feeSubmitVal] || 0) + 1;
        }
      }
    }
  }

  // Sort and print top registration dates
  const sortedRegDates = Object.entries(registrationDates)
    .sort((a, b) => b[1] - a[1]);
  
  console.log("Top registration dates in SQL:");
  console.log(sortedRegDates.slice(0, 20));

  const sortedFeeDates = Object.entries(feeSubmitDates)
    .sort((a, b) => b[1] - a[1]);
  
  console.log("Top fee submit dates in SQL:");
  console.log(sortedFeeDates.slice(0, 20));
  
  console.log(`Total unique registration dates: ${Object.keys(registrationDates).length}`);
  console.log(`Total unique fee submit dates: ${Object.keys(feeSubmitDates).length}`);
}

scan().catch(console.error);
