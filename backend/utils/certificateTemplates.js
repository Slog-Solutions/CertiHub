const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const DEFAULT_TEMPLATE = 'default.html';

// Friendly labels for templates whose <title> isn't descriptive
const LABEL_OVERRIDES = {
  'default.html': 'Default — Training Program (Completion Date)',
};

/**
 * Lists every .html certificate template in backend/templates.
 * Dropping a new .html file into that folder makes it selectable — its <title> is used as the label.
 */
const listCertificateTemplates = () => {
  return fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.toLowerCase().endsWith('.html'))
    .map(file => {
      let label = LABEL_OVERRIDES[file];
      if (!label) {
        const html = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8');
        const match = html.match(/<title>([^<]*)<\/title>/i);
        label = (match && match[1].trim()) || file.replace(/\.html$/i, '');
      }
      return { file, label, isDefault: file === DEFAULT_TEMPLATE };
    })
    .sort((a, b) => (b.isDefault - a.isDefault) || a.label.localeCompare(b.label));
};

/**
 * Returns a safe template filename — falls back to the default when missing or invalid.
 */
const resolveTemplateFile = (file) => {
  if (!file || path.basename(file) !== file || !file.toLowerCase().endsWith('.html')) return DEFAULT_TEMPLATE;
  return fs.existsSync(path.join(TEMPLATES_DIR, file)) ? file : DEFAULT_TEMPLATE;
};

module.exports = { TEMPLATES_DIR, DEFAULT_TEMPLATE, listCertificateTemplates, resolveTemplateFile };
