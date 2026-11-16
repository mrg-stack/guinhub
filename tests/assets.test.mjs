import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('index.html');
const themes = read('themes.js');

function parserLoader() {
  const scripts = [];
  const context = createContext({
    window: {},
    document: {
      addEventListener() {},
      createElement: () => ({ remove() { this.removed = true; } }),
      head: { appendChild: script => scripts.push(script) }
    }
  });
  runInContext(themes, context);
  return { scripts, context, load: () => runInContext('loadMidiParser()', context) };
}

test('theme code is external and the page does not eagerly load MIDI or icon fonts', () => {
  assert.match(html, /<script defer src="themes\.js\?[^"]+"><\/script>/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /@tonejs\/midi|bootstrap-icons.*font/);
  assert.match(html, /href="assets\/icons\.css\?/);
});

test('local SVG subset covers static and dynamically created icons without unused icons', () => {
  const sources = `${html}\n${read('portal.js')}`;
  const expected = [...new Set([...sources.matchAll(/\bbi-([a-z0-9]+(?:-[a-z0-9]+)*)\b/g)]
    .map(match => match[1]))].sort();
  const css = read('assets/icons.css');
  const actual = [...css.matchAll(/\.bi-([a-z0-9-]+)::before/g)].map(match => match[1]).sort();
  assert.deepEqual(actual, expected);
  assert.equal((css.match(/data:image\/svg\+xml,/g) ?? []).length, expected.length);
  assert.doesNotMatch(css, /@font-face/);
  assert.match(read('assets/bootstrap-icons-LICENSE.txt'), /MIT License/);
});

test('MIDI parser is lazy, shares concurrent requests, and reuses the loaded constructor', async () => {
  const loader = parserLoader();
  assert.equal(loader.scripts.length, 0);
  const first = loader.load();
  assert.equal(loader.scripts.length, 1);
  assert.equal(loader.load(), first);
  assert.match(loader.scripts[0].src, /@tonejs\/midi@2\.0\.28\/build\/Midi\.js$/);
  const Midi = function () {};
  loader.context.window.Midi = Midi;
  loader.scripts[0].onload();
  assert.equal(await first, Midi);
  assert.equal(await loader.load(), Midi);
  assert.equal(loader.scripts.length, 1);
});

test('failed MIDI downloads can be retried', async () => {
  const loader = parserLoader();
  const first = loader.load();
  loader.scripts[0].onerror();
  await assert.rejects(first, /Unable to load MIDI parser/);
  assert.equal(loader.scripts[0].removed, true);
  const retry = loader.load();
  assert.equal(loader.scripts.length, 2);
  const Midi = function () {};
  loader.context.window.Midi = Midi;
  loader.scripts[1].onload();
  assert.equal(await retry, Midi);
});

test('a script without a MIDI constructor fails explicitly and allows retry', async () => {
  const loader = parserLoader();
  const first = loader.load();
  loader.scripts[0].onload();
  await assert.rejects(first, /did not expose its constructor/);
  const retry = loader.load();
  loader.scripts[1].onerror();
  await assert.rejects(retry, /Unable to load MIDI parser/);
});
