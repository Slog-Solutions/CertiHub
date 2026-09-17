/**
 * Phone number normalisation for candidate credentials.
 *
 * Bulk-registered students log in with their mobile number as both username
 * and password, so every import must reduce a messy spreadsheet cell to one
 * canonical 10-digit form. Excel hands us numbers, strings, spaces, dashes,
 * "+91" prefixes and leading trunk zeros — all of which must collapse to the
 * same key, or the same student ends up with two accounts.
 */

/**
 * Reduce a raw spreadsheet cell to a bare 10-digit Indian mobile number.
 * Strips every non-digit, then peels off "+91"/"91" country codes and leading
 * trunk zeros (in any combination, e.g. "0091-98765 43210").
 *
 * @param {*} raw value straight from the sheet (string, number, null…)
 * @returns {string} the 10-digit number, or '' when it cannot be normalised
 */
function normalizeMobile(raw) {
  if (raw === null || raw === undefined) return '';

  // Excel may hand back a float (9876543210) or scientific notation for long
  // numeric cells; toFixed keeps the digits intact instead of "9.87654e+9".
  let str = typeof raw === 'number' ? raw.toFixed(0) : String(raw);

  let digits = str.replace(/\D/g, '');
  if (!digits) return '';

  // Peel international/trunk prefixes until we are down to a 10-digit number.
  while (digits.length > 10) {
    if (digits.startsWith('0')) digits = digits.slice(1);
    else if (digits.startsWith('91')) digits = digits.slice(2);
    else break;
  }

  return digits;
}

/**
 * True when the value is a valid Indian mobile number in canonical form.
 * @param {string} digits output of normalizeMobile
 */
function isValidMobile(digits) {
  return /^[6-9]\d{9}$/.test(digits);
}

module.exports = { normalizeMobile, isValidMobile };
