/**
 * Worker thread that bcrypt-hashes one slice of a bulk import.
 *
 * bcryptjs is a pure-JS implementation, so it burns the thread it runs on
 * rather than handing work to libuv's pool. Running it on the main thread
 * would freeze the whole API for the length of an import, so each slice is
 * hashed here instead. hashSync is used deliberately: this thread has nothing
 * else to do, and it avoids the setImmediate churn of the async variant.
 */
const { parentPort, workerData } = require('worker_threads');
const bcrypt = require('bcryptjs');

const { passwords, rounds } = workerData;
parentPort.postMessage(passwords.map(pw => bcrypt.hashSync(pw, rounds)));
