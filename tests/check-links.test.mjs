import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublicLinks } from '../scripts/check-links.mjs';

function capture() {
  const lines = [];
  return { lines, logger: { log: line => lines.push(line), warn: line => lines.push(line), error: line => lines.push(line) } };
}

test('checks unique public anchors, decodes entities, and skips login links and assets', async () => {
  const { logger, lines } = capture();
  const requested = [];
  const html = `
    <link href="https://colorhunt.co/asset.css">
    <a href="https://colorhunt.co/?a=1&amp;b=2">Colors</a>
    <a href="https://colorhunt.co/?a=1&amp;b=2">Duplicate</a>
    <a href="https://outlook.office.com/mail/">Mail</a>
    <a href="mailto:example@example.com">Compose</a>`;
  const failures = await checkPublicLinks(html, { logger, request: async (url, options) => {
    requested.push(url);
    assert.ok(options.signal instanceof AbortSignal);
    return new Response('', { status: 200 });
  } });
  assert.equal(failures, 0);
  assert.deepEqual(requested, ['https://colorhunt.co/?a=1&b=2']);
  assert.ok(lines.some(line => line.startsWith('SKIP')));
});

test('access restrictions require review; broken links and server failures fail', async () => {
  for (const [status, failures, prefix] of [
    [200, 0, 'OK'], [401, 0, 'REVIEW'], [403, 0, 'REVIEW'],
    [429, 0, 'REVIEW'], [404, 1, 'FAIL'], [410, 1, 'FAIL'], [500, 1, 'FAIL']
  ]) {
    const { logger, lines } = capture();
    assert.equal(await checkPublicLinks('<a href="https://colorhunt.co/">Colors</a>', {
      logger, request: async () => new Response('', { status })
    }), failures);
    assert.ok(lines[0].startsWith(`${prefix} ${status}`));
  }
});

test('reports network failures explicitly', async () => {
  const { logger, lines } = capture();
  assert.equal(await checkPublicLinks('<a href="https://somafm.com/listen/">Radio</a>', {
    logger, request: async () => { throw new Error('Connection timed out'); }
  }), 1);
  assert.match(lines[0], /FAIL .*Connection timed out/);
});
