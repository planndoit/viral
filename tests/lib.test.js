import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, compare, decodeRoute, makeLink, savedAnswers, saveAnswers } from '../lib.js';

test('all 64 answer sets round-trip through project-hosted invitations', () => {
  for (let n = 0; n < 64; n++) {
    const answers = n.toString(2).padStart(6, '0');
    const url = new URL(makeLink('https://example.com/viral/?tracking=discard#old', answers));
    assert.equal(url.pathname, '/viral/');
    assert.equal(url.search, '');
    assert.deepEqual(decodeRoute(url.hash), { type: 'invite', host: answers });
  }
});

test('comparison results survive returning a link and have correct counts for all pairs', () => {
  for (let a = 0; a < 64; a++) for (let b = 0; b < 64; b++) {
    const host = a.toString(2).padStart(6, '0');
    const guest = b.toString(2).padStart(6, '0');
    const url = new URL(makeLink('https://example.com/viral/', host, guest));
    assert.deepEqual(decodeRoute(url.hash), { type: 'result', host, guest });
    const expected = [...host].filter((c, i) => c === guest[i]).length;
    assert.equal(compare(host, guest).count, expected);
    assert.equal(compare(host, guest).count, compare(guest, host).count);
  }
});

test('broken, unknown version, injection and oversized links are rejected', () => {
  for (const hash of ['#v2.i.000000', '#v1.i.00000', '#v1.i.000002', '#v1.i.000000.extra', '#v1.r.000000', '#v1.r.000000.111111.extra', '#<script>', '#v1.i.' + '0'.repeat(1000), '#v1.i.%30%30%30%30%30%30']) {
    assert.equal(decodeRoute(hash).type, 'invalid', hash);
  }
  assert.equal(decodeRoute('').type, 'home');
  assert.equal(decodeRoute('#').type, 'home');
  assert.throws(() => makeLink('javascript:alert(1)', '000000'));
  assert.throws(() => makeLink('https://example.com', '00000'));
  assert.throws(() => compare('000000', '111112'));
});

test('local storage failures and old records do not prevent participation', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(savedAnswers(blocked), null);
  assert.equal(saveAnswers(blocked, '000000'), false);
  assert.equal(savedAnswers({ getItem: () => '{broken' }), null);
  assert.equal(savedAnswers({ getItem: () => '{"version":"v0","answers":"000000"}' }), null);
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  assert.equal(saveAnswers(storage, '011010'), true);
  assert.equal(savedAnswers(storage), '011010');
  assert.equal(saveAnswers(storage, 'bad'), false);
});

test('question data provides six complete binary choices', () => {
  assert.equal(QUESTIONS.length, 6);
  assert.equal(new Set(QUESTIONS.map(q => q.tag)).size, 6);
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 2);
    assert.equal(q.short.length, 2);
    assert.ok(q.title && q.options.every(Boolean) && q.short.every(Boolean));
  }
});
