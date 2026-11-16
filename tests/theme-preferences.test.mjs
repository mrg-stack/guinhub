import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function openPage(storage = new Map(), { failRead = false, failWrite = false } = {}) {
  class Element extends EventTarget {
    children = [];
    style = { setProperty() {} };
    dataset = {};
    hidden = true;
    checked = false;
    value = '';
    textContent = '';
    appendChild(child) { this.children.push(child); }
  }
  const ids = [
    'gh-title', 'theme-select', 'portal-status', 'music-toggle', 'music-status',
    'music-control', 'snow-toggle', 'snow-control', 'effects-label', 'canada-theme-trigger'
  ];
  const elements = new Map(ids.map(id => [id, new Element()]));
  const document = Object.assign(new EventTarget(), {
    documentElement: new Element(),
    getElementById: id => elements.get(id) ?? null,
    createElement: () => new Element()
  });
  const window = Object.assign(new EventTarget(), {
    location: { search: '' },
    clearInterval
  });
  const errors = [];
  runInNewContext(script, {
    document, window, Event, URLSearchParams,
    console: { error: (...args) => errors.push(args) },
    localStorage: {
      getItem(key) {
        if (failRead) throw new Error('Storage access denied');
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        if (failWrite) throw new Error('Storage quota exceeded');
        storage.set(key, value);
      }
    }
  });
  document.dispatchEvent(new Event('DOMContentLoaded'));
  return {
    document, window, errors, storage,
    select: elements.get('theme-select'),
    status: elements.get('portal-status')
  };
}

const themeKey = 'guinhub-theme-choice';

test('new visitors receive Vinyl Lounge without automatically saving a theme', () => {
  const page = openPage();
  assert.equal(page.select.value, 'vinyl-lounge');
  assert.equal(page.document.documentElement.dataset.themeId, 'vinyl-lounge');
  assert.equal(page.storage.has(themeKey), false);
  assert.match(html, /<h1 id="gh-title" class="gh-title">GUINhub<\/h1>/);
});

test('explicit choices survive a new page session, including vintage themes', () => {
  for (const id of ['rose-horizon', 'early-internet-97', 'mac-os-7']) {
    const first = openPage();
    first.select.value = id;
    first.select.dispatchEvent(new Event('change'));
    assert.equal(first.storage.get(themeKey), id);
    const reopened = openPage(first.storage);
    assert.equal(reopened.select.value, id);
    assert.equal(reopened.document.documentElement.dataset.themeId, id);
  }
});

test('pageshow corrects browser-restored select state using the saved choice', () => {
  const page = openPage(new Map([[themeKey, 'rose-horizon']]));
  page.select.value = 'early-internet-97';
  page.window.dispatchEvent(new Event('pageshow'));
  assert.equal(page.select.value, 'rose-horizon');
  assert.equal(page.document.documentElement.dataset.themeId, 'rose-horizon');
  assert.equal(page.storage.get(themeKey), 'rose-horizon');
});

test('history restoration updates both theme and selector if the saved choice changed', () => {
  const page = openPage(new Map([[themeKey, 'early-internet-97']]));
  page.storage.set(themeKey, 'rose-horizon');
  page.window.dispatchEvent(new Event('pageshow'));
  assert.equal(page.select.value, 'rose-horizon');
  assert.equal(page.document.documentElement.dataset.themeId, 'rose-horizon');
});

test('unavailable storage reports an error without preventing theme selection', () => {
  const page = openPage(new Map(), { failRead: true, failWrite: true });
  assert.equal(page.document.documentElement.dataset.themeId, 'vinyl-lounge');
  assert.equal(page.status.hidden, false);
  assert.equal(page.errors.length, 1);
  page.select.value = 'rose-horizon';
  page.select.dispatchEvent(new Event('change'));
  assert.equal(page.document.documentElement.dataset.themeId, 'rose-horizon');
  assert.equal(page.errors.length, 2);
});

test('obsolete saved themes fall back without overwriting storage', () => {
  const page = openPage(new Map([[themeKey, 'removed-theme']]));
  assert.equal(page.select.value, 'vinyl-lounge');
  assert.equal(page.document.documentElement.dataset.themeId, 'vinyl-lounge');
  assert.equal(page.storage.get(themeKey), 'removed-theme');
});
