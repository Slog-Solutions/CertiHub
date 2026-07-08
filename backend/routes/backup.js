const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { requireAuth, requireRole } = require('../middleware/auth');

// RESTRICT ALL BACKUP ROUTERS TO ADMIN
router.use(requireAuth, requireRole(['Admin']));

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Reject any filename that isn't a plain backup file name we generated ourselves.
// Prevents path traversal (e.g. "../../server.js") via the :filename route param.
const isValidBackupFilename = (filename) => {
  return typeof filename === 'string' &&
    /^backup-[0-9A-Za-z_-]+\.json$/.test(filename) &&
    path.basename(filename) === filename;
};

// Helper: Run Backup Export
const runBackupExport = async () => {
  const collections = mongoose.connection.collections;
  const backupData = {};

  for (const key in collections) {
    const documents = await collections[key].find({}).toArray();
    backupData[key] = documents;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

  // Run Retention Cleanup
  const retention = parseInt(process.env.BACKUP_RETENTION) || 7;
  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Descending (newest first)

  if (files.length > retention) {
    const toDelete = files.slice(retention);
    toDelete.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log(`Retention cleanup: Deleted old backup file ${file.name}`);
      } catch (err) {
        console.error(`Failed to delete old backup file ${file.name}:`, err.message);
      }
    });
  }

  return { fileName, filePath };
};

// @route   POST /api/backup/trigger
// @desc    Manually trigger database JSON export
// @access  Private (Admin only)
router.post('/trigger', async (req, res) => {
  try {
    const { fileName } = await runBackupExport();
    res.json({ message: 'Backup created successfully', file: fileName });
  } catch (err) {
    console.error('Backup trigger error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/backup/list
// @desc    List all backups available on disk
// @access  Private (Admin only)
router.get('/list', async (req, res) => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return {
          filename: file,
          sizeBytes: stats.size,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/backup/download/:filename
// @desc    Download a specific backup file
// @access  Private (Admin only)
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!isValidBackupFilename(filename)) {
    return res.status(400).json({ error: 'Invalid backup filename' });
  }
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  res.download(filePath, filename);
});

// @route   DELETE /api/backup/:filename
// @desc    Delete a specific backup file manually
// @access  Private (Admin only)
router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!isValidBackupFilename(filename)) {
    return res.status(400).json({ error: 'Invalid backup filename' });
  }
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: 'Backup file deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router,
  runBackupExport
};
