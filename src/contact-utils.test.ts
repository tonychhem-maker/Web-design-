import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactForm,
  formatCharCounter,
  generateAckNumber,
  buildMailtoFallback,
  calculateLatencyJitter
} from './contact-utils';

test('validateContactForm rejects empty form', () => {
  const result = validateContactForm({
    name: '',
    email: '',
    topic: 'Agent deployment',
    message: '',
    consent: false
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.message);
  assert.ok(result.errors.consent);
});

test('validateContactForm rejects invalid email', () => {
  const result = validateContactForm({
    name: 'Ada Lovelace',
    email: 'not-an-email',
    topic: 'Agent deployment',
    message: 'We need custom agents for automated testing pipelines.',
    consent: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.email);
  assert.equal(result.errors.name, undefined);
});

test('validateContactForm rejects short message (< 10 chars)', () => {
  const result = validateContactForm({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    topic: 'Agent deployment',
    message: 'Hello!',
    consent: true
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.message);
});

test('validateContactForm rejects honeypot spam', () => {
  const result = validateContactForm({
    name: 'Bot Spammer',
    email: 'bot@spam.com',
    topic: 'Agent deployment',
    message: 'Check out our crypto services immediately!',
    consent: true,
    honeypot: 'http://spam-site.com'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.honeypot);
});

test('validateContactForm passes valid submission', () => {
  const result = validateContactForm({
    name: 'Grace Hopper',
    email: 'grace@navy.mil',
    topic: 'Custom Orchestrator',
    message: 'Looking to integrate orchestrator agent into distributed compilers.',
    consent: true
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('formatCharCounter zero-pads count correctly', () => {
  assert.equal(formatCharCounter(0, 1200), '0000 / 1200');
  assert.equal(formatCharCounter(42, 1200), '0042 / 1200');
  assert.equal(formatCharCounter(999, 1200), '0999 / 1200');
  assert.equal(formatCharCounter(1200, 1200), '1200 / 1200');
  assert.equal(formatCharCounter(1300, 1200), '1200 / 1200');
});

test('generateAckNumber produces formatted string', () => {
  assert.equal(generateAckNumber('BK', 4096), '#BK-4096');
  const dynamic = generateAckNumber('BK');
  assert.match(dynamic, /^#BK-\d{4}$/);
});

test('buildMailtoFallback constructs encoded mailto URI', () => {
  const uri = buildMailtoFallback('contact@blackrock-ai.com', {
    name: 'Alan Turing',
    email: 'alan@bletchley.uk',
    topic: 'Agent deployment',
    message: 'Need help with cryptographic verification agent.',
    consent: true
  });
  assert.ok(uri.startsWith('mailto:contact@blackrock-ai.com?subject='));
  assert.ok(uri.includes('Alan%20Turing'));
  assert.ok(uri.includes('cryptographic%20verification'));
});

test('calculateLatencyJitter returns numbers within reasonable bounds', () => {
  const j1 = calculateLatencyJitter(12, 3, 0);
  const j2 = calculateLatencyJitter(12, 3, 0.5);
  const j3 = calculateLatencyJitter(12, 3, 1);
  assert.equal(j1, 9);
  assert.equal(j2, 12);
  assert.equal(j3, 15);
});
