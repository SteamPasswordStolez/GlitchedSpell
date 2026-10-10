import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveLocale, supportedLocales, translations } from '../src/studio/locales.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all six locales cover every text and accessibility key used by the site', () => {
  assert.deepEqual(supportedLocales, ['ko','en','es','fr','de','ja']);
  const keys = [...html.matchAll(/data-i18n(?:-aria|-alt)?="([^"]+)"/g)].map(match => match[1]);
  const expectedKeys = Object.keys(translations.en).sort();
  for (const locale of supportedLocales) {
    assert.deepEqual(Object.keys(translations[locale]).sort(), expectedKeys, locale);
    for (const key of [...keys,'title','metaDescription','menuClose']) {
      assert.equal(typeof translations[locale][key], 'string', `${locale}: ${key}`);
      assert.ok(translations[locale][key].trim().length > 0, `${locale}: ${key}`);
    }
  }
});

test('URL, saved preference, browser language and fallback have correct priority', () => {
  assert.equal(resolveLocale({search:'?lang=fr',stored:'ja',languages:['ko-KR']}), 'fr');
  assert.equal(resolveLocale({search:'?lang=invalid',stored:'ja',languages:['ko-KR']}), 'ja');
  assert.equal(resolveLocale({languages:['zh-CN','es-MX','en-US']}), 'es');
  assert.equal(resolveLocale({languages:['KO-kr']}), 'ko');
  assert.equal(resolveLocale({search:'?lang=%3Cscript%3E',stored:'unknown',languages:['zh']}), 'en');
  assert.equal(resolveLocale(), 'en');
});

test('all Strikegy calls to action use the requested external destination safely', () => {
  const links = [...html.matchAll(/<a\b[^>]*href="https:\/\/strikegy\.xyz"[^>]*>/g)].map(match => match[0]);
  assert.equal(links.length, 3);
  for (const link of links) {
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
  }
});

test('internal navigation targets and local assets exist', () => {
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), match[1]);
  for (const path of ['/favicon.svg','/assets/strikegy-arena.svg']) {
    assert.ok(readFileSync(new URL(`../public${path}`, import.meta.url)).length > 0);
  }
  assert.match(html, /name="viewport"/);
});
