const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching for tbl_registration insert values with valid dates...");
  let insideRegistration = false;
  let foundCount = 0;
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
      // This is a values line. It starts with ( and has multiple rows or one row.
      // Let's check if it contains a year pattern like '2023-' or '2024-' or '2022-'
      if (line.includes("'202") || line.includes("'201")) {
        foundCount++;
        console.log(`Match ${foundCount}:`, line.substring(0, 1000));
        if (foundCount >= 5) break;
      }
    }
  }
}

scan().catch(console.error);
