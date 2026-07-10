// Escapes regex special characters so user-supplied search text is always
// treated as a literal substring match, never as regex syntax.
// Prevents ReDoS (e.g. "(a+)+$") and unexpected wildcard behavior (e.g. ".*").
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchRegex(str, flags = 'i') {
  return new RegExp(escapeRegex(str), flags);
}

module.exports = { escapeRegex, buildSearchRegex };
