const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Counting records in SQL dump tables...");
  const tableCounts = {};
  let currentTable = null;
  
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed.startsWith('INSERT INTO `')) {
      const match = trimmed.match(/INSERT INTO `([^`]+)`/);
      if (match) {
        currentTable = match[1];
        if (!tableCounts[currentTable]) {
          tableCounts[currentTable] = 0;
        }
      }
      continue;
    }
    
    if (currentTable) {
      if (trimmed.startsWith('(')) {
        // Count rows by splitting on matches of "), (" or similar.
        // We can split by '), (' or ');' to see how many elements are there.
        // Let's do a regex split.
        const parts = trimmed.split(/\),\s*\(/);
        tableCounts[currentTable] += parts.length;
      } else if (trimmed === '' || trimmed.startsWith('COMMIT') || trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('--')) {
        currentTable = null;
      }
    }
  }
  
  console.log("SQL Table Record Counts:");
  console.log(JSON.stringify(tableCounts, null, 2));
}

scan().catch(console.error);
