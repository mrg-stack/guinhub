import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../portal.js', import.meta.url), 'utf8');
const context = { document: { addEventListener() {} }, URL };
runInNewContext(script, context);

const destinations = href => context.getMicrosoft365Destinations(href);

test('Microsoft 365 toggle is present and defaults to desktop links', () => {
  assert.match(html, /id="m365-browser" type="checkbox"/);
  assert.doesNotMatch(html, /id="m365-browser" type="checkbox" checked/);
  assert.match(html, /Office 365-apps/);
});

test('Teams links support desktop and browser destinations', () => {
  const web = 'https://teams.microsoft.com/l/team/19%3Aclass/conversations?groupId=123&tenantId=456';
  assert.deepEqual(
    JSON.parse(JSON.stringify(destinations(web))),
    {
      browser: web,
      desktop: 'msteams://teams.microsoft.com/l/team/19%3Aclass/conversations?groupId=123&tenantId=456'
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(destinations(`msteams://${web}`))),
    {
      browser: web,
      desktop: 'msteams://teams.microsoft.com/l/team/19%3Aclass/conversations?groupId=123&tenantId=456'
    }
  );
});

test('Outlook inbox and compose links preserve recipients', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(destinations('https://outlook.office.com/mail/'))),
    { browser: 'https://outlook.office.com/mail/', desktop: 'ms-outlook://' }
  );
  const compose = 'https://outlook.office.com/mail/deeplink/compose?to=class@stud.kea.dk,teacher@ek.dk';
  assert.equal(
    destinations(compose).desktop,
    'ms-outlook://compose?to=class%40stud.kea.dk%2Cteacher%40ek.dk'
  );
});

test('Office app launchers and existing document links can switch destinations', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(destinations('https://www.office.com/launch/excel'))),
    { browser: 'https://www.office.com/launch/excel', desktop: 'ms-excel:' }
  );
  const document = 'ms-excel:ofe|u|https://example.sharepoint.com/sites/team/plan.xlsx';
  assert.deepEqual(
    JSON.parse(JSON.stringify(destinations(document))),
    {
      browser: 'https://example.sharepoint.com/sites/team/plan.xlsx?web=1',
      desktop: document
    }
  );
});

test('existing SharePoint document queries are preserved when browser mode is selected', () => {
  const document =
    'ms-excel:ofe|u|https://tenant.sharepoint.com/:x:/r/sites/team/Gruppe%20ark.xlsx?d=123&csf=1&e=abc';
  const result = destinations(document);
  assert.equal(
    result.browser,
    'https://tenant.sharepoint.com/:x:/r/sites/team/Gruppe%20ark.xlsx?d=123&csf=1&e=abc&web=1'
  );
  assert.equal(new URL(result.browser).searchParams.get('web'), '1');
  assert.equal(result.desktop, document);
});
