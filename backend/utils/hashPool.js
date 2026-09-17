/**
 * Parallel bcrypt hashing across worker threads.
 *
 * A 4,500-row import needs 4,500 hashes; done in-process that is several
 * minutes of blocked event loop and a guaranteed request timeout. Splitting
 * the work across cores cuts it to well under a minute and, more importantly,
 * leaves the main thread free to keep serving other requests.
 */
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Worker } = require('worker_threads');

const WORKER_FILE = path.join(__dirname, 'hashWorker.js');

// Below this, spawning threads costs more than it saves.
const MIN_ROWS_FOR_WORKERS = 100;

// Leave a core free so the main thread stays responsive during an import.
const DEFAULT_MAX_WORKERS = Math.max(1, Math.min(8, (os.cpus().length || 2) - 1));

function runWorker(passwords, rounds) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_FILE, { workerData: { passwords, rounds } });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', code => {
      if (code !== 0) reject(new Error(`Hash worker stopped with exit code ${code}`));
    });
  });
}

/**
 * Hash a list of plaintext passwords, preserving order.
 *
 * @param {string[]} passwords
 * @param {{rounds?: number, maxWorkers?: number}} [options]
 * @returns {Promise<string[]>} hashes, index-aligned with `passwords`
 */
async function hashPasswords(passwords, options = {}) {
  const rounds = options.rounds || 10;
  const maxWorkers = options.maxWorkers || DEFAULT_MAX_WORKERS;

  if (!passwords.length) return [];

  // Small imports: not worth the thread spin-up, but still yield between
  // hashes so the event loop is not starved.
  if (passwords.length < MIN_ROWS_FOR_WORKERS || maxWorkers === 1) {
    const out = [];
    for (const pw of passwords) out.push(await bcrypt.hash(pw, rounds));
    return out;
  }

  const workerCount = Math.min(maxWorkers, passwords.length);
  const sliceSize = Math.ceil(passwords.length / workerCount);

  const slices = [];
  for (let i = 0; i < passwords.length; i += sliceSize) {
    slices.push(passwords.slice(i, i + sliceSize));
  }

  try {
    const results = await Promise.all(slices.map(slice => runWorker(slice, rounds)));
    return results.flat();
  } catch (err) {
    // A sandboxed or thread-restricted host should still be able to import;
    // fall back to in-process hashing rather than failing the whole upload.
    console.error('[hashPool] worker hashing failed, falling back in-process:', err.message);
    const out = [];
    for (const pw of passwords) out.push(await bcrypt.hash(pw, rounds));
    return out;
  }
}

module.exports = { hashPasswords, DEFAULT_MAX_WORKERS };
