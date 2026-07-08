const cron = require('node-cron');
const { runBackupExport } = require('../routes/backup');

const initBackupScheduler = () => {
  // Run once daily at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('CRON: Starting daily automated database backup...');
    try {
      const { fileName } = await runBackupExport();
      console.log(`CRON: Automated backup completed successfully: ${fileName}`);
    } catch (err) {
      console.error('CRON: Automated backup failed:', err.message);
    }
  });
  console.log('Scheduler: Daily automated backups active at midnight (00:00)');
};

module.exports = initBackupScheduler;
