import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicHosts = new Set([
  'www.svgrepo.com', 'www.pexels.com', 'getbootstrap.com', 'www.coderstool.com',
  'colorhunt.co', 'somafm.com', 'www.ek.dk', 'studieordninger.kea.dk'
]);
export async function checkPublicLinks(html, { request = fetch, logger = console } = {}) {
  const urls = [...new Set([...html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/g)]
    .map(match => match[1].replaceAll('&amp;', '&')))];
  let failures = 0;
  for (const url of urls) {
    if (!publicHosts.has(new URL(url).hostname)) {
      logger.log(`SKIP (host outside public allowlist; manual verification required): ${url}`);
      continue;
    }
    try {
      const response = await request(url, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'GUINhub-LinkChecker/1.0' }
      });
      await response.body?.cancel();
      if (response.ok) {
        logger.log(`OK ${response.status}: ${url}`);
      } else if ([401, 403, 429].includes(response.status)) {
        logger.warn(`REVIEW ${response.status} (access restricted or rate limited): ${url}`);
      } else {
        failures++;
        logger.error(`FAIL ${response.status}: ${url}`);
      }
    } catch (error) {
      failures++;
      logger.error(`FAIL ${url}: ${error.message}`);
    }
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  if (await checkPublicLinks(html)) process.exitCode = 1;
}
