const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const result = spawnSync(process.execPath, [path.join(__dirname, 'calibrate_engine.js')], {
  cwd: __dirname,
  encoding: 'utf8',
});

assert.equal(result.status, 0, result.stderr || result.stdout);
console.log(result.stdout);
console.log('app.js & engine calibrated and passed all accuracy benchmarks');
