const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const datesToSearch = [
    '2023-08-03',
    '2023-10-04',
    '2024-01-29',
    '2024-01-30',
    '2024-02-21',
    '2024-05-02',
    '2024-04-16',
    '2025-05-31',
    '2025-10-29',
    '2025-12-02',
    '2026-02-11',
    '2026-04-08'
  ];

  console.log("Searching for dashboard dates in SQL dump (unrestricted)...");
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    for (const date of datesToSearch) {
      if (line.includes(date)) {
        console.log(`Line ${lineNum} contains ${date}:`, line.substring(0, 300) + '...');
      }
    }
  }
}

scan().catch(console.error);
