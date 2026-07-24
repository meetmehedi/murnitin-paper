const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const result = spawnSync(process.execPath, [path.join(__dirname, 'app.js')], {
  cwd: __dirname,
  encoding: 'utf8',
});

assert.equal(result.status, 0, result.stderr || result.stdout);
console.log('app.js exits successfully under Node without browser globals');
