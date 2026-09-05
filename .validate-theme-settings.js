/*
 * Validate every numeric setting value in templates/index.json against the
 * `range` schema that owns it (min / max / step), the same way Shopify does
 * on upload. Also reports select/radio values that are not in their options.
 */
const fs = require('fs');
const path = require('path');

function stripComment(t) { return t.replace(/^\s*\/\*[\s\S]*?\*\//, ''); }

const unparseable = [];

/** Pull `{% schema %}` JSON out of a Liquid file. */
function schemaOf(file) {
  if (!fs.existsSync(file)) return null;
  const t = fs.readFileSync(file, 'utf8');
  // Take the LAST schema/endschema pair: some AI-generated blocks quote a
  // literal "{% schema %}" inside their {% doc %} prompt text, and a
  // first-match regex would grab that instead of the real schema.
  const open = t.lastIndexOf('{% schema %}');
  const close = t.lastIndexOf('{% endschema %}');
  const m = open !== -1 && close > open ? [null, t.slice(open + '{% schema %}'.length, close)] : null;
  if (!m) return null;
  // Several stock sections ship trailing commas in their schema. Shopify
  // tolerates them, JSON.parse does not — strip them so a lax schema does not
  // silently skip validation of the values it owns.
  const lenient = m[1].replace(/,(\s*[}\]])/g, '$1');
  try {
    return JSON.parse(lenient);
  } catch (e) {
    unparseable.push(file + ': ' + e.message);
    return null;
  }
}

/** Flatten a schema into { settings: {id: def}, blocks: {type: {id: def}} }. */
function indexSchema(schema) {
  const out = { settings: {}, blocks: {} };
  if (!schema) return out;
  for (const s of schema.settings || []) if (s.id) out.settings[s.id] = s;
  for (const b of schema.blocks || []) {
    out.blocks[b.type] = {};
    for (const s of b.settings || []) if (s.id) out.blocks[b.type][s.id] = s;
  }
  return out;
}

const doc = JSON.parse(stripComment(fs.readFileSync('templates/index.json', 'utf8')));
const problems = [];

const schemaProblems = [];

/**
 * Shopify's own constraints on a `range` definition, independent of any value:
 *   - at most 101 steps between min and max
 *   - step > 0, max > min
 *   - the default must itself sit on the step grid and inside the bounds
 * A violation here rejects the whole file on upload ("Invalid schema"), which
 * is a different failure from a value being off-grid.
 */
function checkRangeDef(def, where) {
  if (!def || def.type !== 'range') return;
  // Shopify defaults an omitted min to 0 and an omitted step to 1.
  const min = def.min === undefined ? 0 : def.min;
  const step = def.step === undefined ? 1 : def.step;
  const max = def.max;
  const at = `${where}.${def.id}`;
  if (typeof min !== 'number' || typeof max !== 'number' || typeof step !== 'number') {
    schemaProblems.push(`${at}: range needs numeric min, max and step`);
    return;
  }
  if (step <= 0) schemaProblems.push(`${at}: step must be greater than 0`);
  if (max <= min) schemaProblems.push(`${at}: max (${max}) must be greater than min (${min})`);
  const steps = (max - min) / step;
  if (steps > 100) {
    schemaProblems.push(
      `${at}: ${Math.round(steps) + 1} steps for min ${min}, max ${max}, step ${step}` +
        ` — Shopify allows at most 101. Raise step to at least ${Math.ceil((max - min) / 100)}` +
        ` or narrow the range.`
    );
  }
  if (def.default !== undefined) {
    const n = (def.default - min) / step;
    if (def.default < min || def.default > max) {
      schemaProblems.push(`${at}: default ${def.default} is outside ${min}..${max}`);
    } else if (Math.abs(n - Math.round(n)) > 1e-9) {
      schemaProblems.push(`${at}: default ${def.default} is not on the step grid`);
    }
  }
}

function check(def, id, value, where) {
  if (!def) return;
  if (def.type === 'range') {
    if (typeof value !== 'number') {
      problems.push(`${where}.${id}: range expects a number, got ${JSON.stringify(value)}`);
      return;
    }
    // same defaults Shopify applies for an omitted min / step
    const min = def.min === undefined ? 0 : def.min;
    const step = def.step === undefined ? 1 : def.step;
    const max = def.max;
    if (value < min || value > max) {
      problems.push(`${where}.${id} = ${value} is outside range ${min}..${max}`);
      return;
    }
    // Shopify requires the value to land exactly on min + n*step
    const steps = (value - min) / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) {
      const lo = min + Math.floor(steps) * step;
      const hi = Math.min(max, lo + step);
      problems.push(
        `${where}.${id} = ${value} is not a step in range ${min}..${max} step ${step}` +
        `  -> nearest valid: ${lo} or ${hi}`
      );
    }
  } else if ((def.type === 'select' || def.type === 'radio') && def.options) {
    const allowed = def.options.map((o) => o.value);
    if (value !== '' && value != null && !allowed.includes(value)) {
      problems.push(`${where}.${id} = ${JSON.stringify(value)} not in options [${allowed.join(', ')}]`);
    }
  }
}

/* ------------------------------------------------------------------ pass 1
   Every `range` definition in every section and block, whether or not the
   homepage uses it. An invalid definition rejects the whole file on upload,
   so this has to be checked independently of the saved values. */
for (const dir of ['sections', 'blocks']) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.liquid'))) {
    const schema = schemaOf(path.join(dir, file));
    if (!schema) continue;
    for (const s of schema.settings || []) checkRangeDef(s, file);
    for (const b of schema.blocks || []) {
      for (const s of b.settings || []) checkRangeDef(s, `${file}:${b.type}`);
    }
  }
}

/* ------------------------------------------------------------------ pass 2
   The saved homepage values, against the definitions that own them. */
for (const [sid, sec] of Object.entries(doc.sections)) {
  const secSchema = indexSchema(schemaOf(path.join('sections', sec.type + '.liquid')));
  for (const [k, v] of Object.entries(sec.settings || {})) {
    check(secSchema.settings[k], k, v, `${sec.type}(${sid})`);
  }
  for (const [bid, blk] of Object.entries(sec.blocks || {})) {
    // section-local block, or a theme block from blocks/<type>.liquid
    let defs = secSchema.blocks[blk.type];
    if (!defs) defs = indexSchema(schemaOf(path.join('blocks', blk.type + '.liquid'))).settings;
    for (const [k, v] of Object.entries(blk.settings || {})) {
      check(defs && defs[k], k, v, `${sec.type}/${blk.type}(${bid})`);
    }
  }
}

if (unparseable.length) {
  console.log(
    'SCHEMAS THAT COULD NOT BE PARSED (their values were NOT checked):\n' +
      unparseable.map((u) => '  ' + u).join('\n')
  );
  process.exitCode = 1;
}

if (schemaProblems.length) {
  console.log(
    'INVALID RANGE DEFINITIONS (these reject the whole file on upload):\n' +
      schemaProblems.map((p) => '  ' + p).join('\n')
  );
  process.exitCode = 1;
}

if (problems.length) {
  console.log('INVALID VALUES:\n' + problems.map((p) => '  ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log('all numeric/select values valid against their schemas');
}
