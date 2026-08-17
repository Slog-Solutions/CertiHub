// validate-json.js
const fs = require('fs');
const path = require('path');

const root = process.cwd(); // run from project root
const exts = ['.json', '.geojson'];

function findFiles(dir) {
  let out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip node_modules and .next for speed
      if (['node_modules', '.next', '.git'].includes(e.name)) continue;
      out = out.concat(findFiles(full));
    } else {
      if (exts.includes(path.extname(e.name).toLowerCase())) out.push(full);
    }
  }
  return out;
}

function indexToLineCol(text, index) {
  const sliced = text.slice(0, index);
  const lines = sliced.split(/\r?\n/);
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

function findUnquotedKeys(text) {
  // Looks for token patterns like:   name: "value"   or   name: { ...
  // This will produce some false-positives inside strings but is useful for quick detection.
  const regex = /(^|[\{\s,])([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm;
  let match, results = [];
  while ((match = regex.exec(text)) !== null) {
    const idx = match.index + match[1].length;
    const pos = indexToLineCol(text, idx);
    results.push({ key: match[2], index: idx, line: pos.line, col: pos.col });
    if (results.length >= 10) break;
  }
  return results;
}

const searchRoot = path.join(root, 'public', 'data'); // adjust if your data is elsewhere
const filesToCheck = (fs.existsSync(searchRoot) ? findFiles(searchRoot) : []).concat(
  // also check top-level jsons just in case
  findFiles(root).filter(f => ['package.json', 'tsconfig.json', 'next.config.js'].includes(path.basename(f))).slice(0)
);

// unique
const set = new Set(filesToCheck);
const files = Array.from(set).sort();

if (files.length === 0) {
  console.log('No .json or .geojson files found in public/data or project root (checked some common files).');
  process.exit(0);
}

let anyError = false;
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    JSON.parse(txt);
    console.log('OK  :', path.relative(root, f));
  } catch (err) {
    anyError = true;
    console.error('\nERROR:', path.relative(root, f));
    console.error('  parse error ->', err.message);

    // try to extract "position N" from V8 message
    const m = /position\s+(\d+)/i.exec(err.message) || /at\s+position\s+(\d+)/i.exec(err.message);
    let posIndex = null;
    if (m && m[1]) posIndex = parseInt(m[1], 10);

    // If position available, show line/col and snippet
    const text = fs.readFileSync(f, 'utf8');
    if (posIndex !== null && !Number.isNaN(posIndex)) {
      const lc = indexToLineCol(text, posIndex);
      console.error(`  position index: ${posIndex} -> line ${lc.line} col ${lc.col}`);
      const lines = text.split(/\r?\n/);
      const start = Math.max(0, lc.line - 3 - 1);
      const end = Math.min(lines.length, lc.line + 2);
      console.error('  context:');
      for (let i = start; i < end; i++) {
        const mark = (i + 1 === lc.line) ? '>>' : '  ';
        console.error(`${mark} ${String(i+1).padStart(4)} | ${lines[i]}`);
      }
    } else {
      // fallback: try detecting unquoted keys
      const suspects = findUnquotedKeys(text);
      if (suspects.length) {
        console.error('  Possible unquoted property names (first matches):');
        for (const s of suspects.slice(0, 8)) {
          console.error(`    ${s.key}  @ line ${s.line} col ${s.col}`);
          const line = text.split(/\r?\n/)[s.line - 1] || '';
          console.error(`      -> ${line.trim()}`);
        }
      } else {
        console.error('  Could not find a position in the error message and found no obvious unquoted keys.');
        // Give snippet of beginning
        console.error('  File start (first 20 lines):\n' + text.split(/\r?\n/).slice(0,20).map((l,i)=>`${String(i+1).padStart(3)} | ${l}`).join('\n'));
      }
    }
  }
}

if (!anyError) console.log('\nAll JSON/GeoJSON files parsed successfully.');
else console.log('\nOne or more files failed to parse. Fix the reported lines and re-run.');
