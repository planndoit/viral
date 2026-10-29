import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('Vercel build uses the deployment image URL without changing source HTML', () => {
  const original = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const env = { ...process.env, VERCEL_URL: '', VERCEL_ENV: '', VERCEL_PROJECT_PRODUCTION_URL: '' };
  const root = new URL('../', import.meta.url);
  function build(extra = {}) {
    const result = spawnSync(process.execPath, ['scripts/build.js'], { cwd: root, env: { ...env, ...extra }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  }
  try {
    assert.match(build({ VERCEL_URL: 'taste-preview.vercel.app' }), /content="https:\/\/taste-preview\.vercel\.app\/share\.png"/);
    assert.match(build({ VERCEL_ENV: 'production', VERCEL_URL: 'taste-build.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'taste.vercel.app' }), /content="https:\/\/taste\.vercel\.app\/share\.png"/);
    assert.equal(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), original);
  } finally { build(); }
});
