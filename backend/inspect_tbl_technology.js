const fs = require('fs');
const readline = require('readline');

async function scan() {
  const fileStream = fs.createReadStream('e:/certyhub/u949813839_slog_tree.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Scanning tbl_technology...");
  let printLines = false;
  let insertCount = 0;
  for await (const line of rl) {
    if (line.startsWith('CREATE TABLE `tbl_technology`')) {
      printLines = true;
    }
    if (printLines) {
      console.log(line);
      if (line.startsWith(') ENGINE=')) {
        printLines = false;
      }
    }
    if (line.startsWith('INSERT INTO `tbl_technology`')) {
      insertCount++;
      if (insertCount <= 3) {
        console.log(line.substring(0, 1000) + '...');
      }
    }
  }
}

scan().catch(console.error);
