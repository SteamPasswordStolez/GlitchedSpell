import { resolveLocale, supportedLocales, translations } from './locales.js';

const storageKey = 'glitchedspell-language';
const select = document.querySelector('#language');
const navigation = document.querySelector('#navigation');
const menuButton = document.querySelector('.menu-toggle');
let currentLocale;

function storedLanguage() {
  try { return localStorage.getItem(storageKey); } catch { return null; }
}

function setMenu(open, returnFocus = false) {
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', translations[currentLocale][open ? 'menuClose' : 'menuOpen']);
  if (returnFocus) menuButton.focus();
}

function setLocale(locale, updateUrl = false) {
  if (!supportedLocales.includes(locale)) return;
  currentLocale = locale;
  const messages = translations[locale];
  document.documentElement.lang = locale;
  document.title = messages.title;
  document.querySelector('meta[name="description"]').content = messages.metaDescription;
  document.querySelector('meta[property="og:title"]').content = messages.title;
  document.querySelector('meta[property="og:description"]').content = messages.metaDescription;
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = messages[element.dataset.i18n];
  }
  for (const element of document.querySelectorAll('[data-i18n-aria]')) {
    element.setAttribute('aria-label', messages[element.dataset.i18nAria]);
  }
  for (const element of document.querySelectorAll('[data-i18n-alt]')) {
    element.alt = messages[element.dataset.i18nAlt];
  }
  select.value = locale;
  if (menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-label', messages.menuClose);
  }
  try { localStorage.setItem(storageKey, locale); } catch { /* Language still works without storage. */ }
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', locale);
    history.replaceState(null, '', url);
  }
}

setLocale(resolveLocale({ search: location.search, stored: storedLanguage(), languages: navigator.languages }));
select.addEventListener('change', () => setLocale(select.value, true));
window.addEventListener('popstate', () => setLocale(resolveLocale({ search: location.search, stored: storedLanguage(), languages: navigator.languages })));
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
window.matchMedia('(min-width: 761px)').addEventListener('change', () => setMenu(false));
document.querySelector('#year').textContent = new Date().getFullYear();
