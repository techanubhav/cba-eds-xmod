import {
  buildBlock,
  decorateBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  sampleRUM,
  loadCSS,
  loadScript,
  getMetadata,
  toCamelCase,
  toClassName,
} from './aem.js';
import { getAllMetadata } from './shared.js';
import dynamicBlocks from '../blocks/dynamic/index.js';

const AUDIENCES = {
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,
};

// --- BEGIN DM/Scene7 auto-block (excat-generated) ---

const DM_BREAKPOINTS = [
  { media: '(min-width: 600px)', width: 2000 }, // desktop
  { width: 750 },                               // mobile / fallback (no media)
];

// ---- Canonical helpers (keep in sync with dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function buildScene7Rendition(src, { width, format }) {
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const pairs = query.split('&').filter((p) => p);
  const filtered = pairs.filter((p) => {
    const k = p.split('=')[0];
    return k !== 'wid' && k !== 'fmt';
  });
  filtered.push(`wid=${width}`);
  filtered.push(`fmt=${format}`);
  return `${base}?${filtered.join('&')}`;
}

function buildDmOpenApiRendition(src, { width }) {
  const url = new URL(src, 'https://x/');
  url.searchParams.set('width', String(width));
  return url.toString();
}

function findDmOnAnchor(a) {
  if (!a || typeof a.getAttribute !== 'function') return null;
  const href = a.getAttribute('href') || '';
  if (detectDynamicMediaUrl(href)) return { mode: 'unlinked', dmUrl: href };
  const title = a.getAttribute('title') || '';
  if (detectDynamicMediaUrl(title)) return { mode: 'linked', dmUrl: title };
  return null;
}

function isUnwrappableMarkdownParagraph(anchor) {
  const parent = anchor && anchor.parentElement;
  if (!parent || parent.tagName !== 'P') return false;
  if (parent.children.length !== 1 || parent.firstElementChild !== anchor) return false;
  return parent.textContent.trim() === anchor.textContent.trim();
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function linkTextToAlt(linkText) {
  return linkText === EMPTY_ALT_SENTINEL ? '' : linkText;
}

// ---- Rendering ----
function appendSource(picture, { type, srcset, media }) {
  const source = document.createElement('source');
  if (type) source.type = type;
  source.srcset = srcset;
  if (media) source.setAttribute('media', media);
  picture.append(source);
}

function renderScene7Picture(src, alt) {
  const picture = document.createElement('picture');
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/webp',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'webp' }),
    media: bp.media,
  }));
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/jpeg',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'jpg' }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildScene7Rendition(src, { width: 750, format: 'jpg' });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function renderDmOpenApiPicture(src, alt) {
  const picture = document.createElement('picture');
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    srcset: buildDmOpenApiRendition(src, { width: bp.width }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildDmOpenApiRendition(src, { width: 750 });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function buildDynamicMediaImages(main) {
  main.querySelectorAll('a').forEach((a) => {
    const match = findDmOnAnchor(a);
    if (!match) return;

    const { mode, dmUrl } = match;
    const alt = linkTextToAlt(a.textContent.trim());
    const picture = detectDynamicMediaUrl(dmUrl) === 'scene7'
      ? renderScene7Picture(dmUrl, alt)
      : renderDmOpenApiPicture(dmUrl, alt);

    a.classList.remove('button', 'primary', 'secondary');
    if (a.classList.length === 0) a.removeAttribute('class');
    const buttonContainer = a.parentElement;
    if (
      buttonContainer
      && buttonContainer.classList.contains('button-container')
      && buttonContainer.children.length === 1
    ) {
      buttonContainer.classList.remove('button-container');
      if (buttonContainer.classList.length === 0) buttonContainer.removeAttribute('class');
    }

    if (mode === 'linked') {
      a.removeAttribute('title');
      a.replaceChildren(picture);
      return;
    }

    if (isUnwrappableMarkdownParagraph(a)) {
      a.parentElement.replaceWith(picture);
    } else {
      a.replaceWith(picture);
    }
  });
}

window.__dmRender__ = (src, alt) => {
  const family = detectDynamicMediaUrl(src);
  if (!family) return null;
  return family === 'scene7'
    ? renderScene7Picture(src, alt)
    : renderDmOpenApiPicture(src, alt);
};

// --- END DM/Scene7 auto-block ---

function getExperimentationContext() {
  return {
    getAllMetadata, getMetadata, loadCSS, loadScript, sampleRUM, toCamelCase, toClassName,
  };
}

function isExperimentationEnabled() {
  return getMetadata('experiment')
    || Object.keys(getAllMetadata('campaign')).length
    || Object.keys(getAllMetadata('audience')).length;
}

const THEME_STORAGE_KEY = 'demo-theme';

function applyTheme(theme) {
  let t = theme ?? (() => { try { return localStorage.getItem(THEME_STORAGE_KEY); } catch (e) { return null; } })();
  if (t !== 'light' && t !== 'dark') {
    t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = t;
  document.body.classList.remove('light-scheme', 'dark-scheme');
  document.body.classList.add(`${t}-scheme`);
}

const isYoutubeLink = (url) => ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname);

function replaceParagraphWithBlock(link, block) {
  const parent = link.parentElement;
  if (parent?.tagName === 'P' && parent.children.length === 1) {
    parent.replaceWith(block);
  } else {
    link.replaceWith(block);
  }
}

function buildEmbedBlocks(main) {
  const youtubeVideos = main.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]');
  youtubeVideos.forEach((anchor) => {
    if (anchor.closest('.embed.block')) return;
    if (anchor.querySelector('.icon')) return;

    let url;
    try {
      url = new URL(anchor.href);
    } catch (e) {
      return;
    }
    if (!isYoutubeLink(url)) return;

    const block = buildBlock('embed', [[anchor.cloneNode(true)]]);
    replaceParagraphWithBlock(anchor, block);
    decorateBlock(block);
  });
}

async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/** Hash that opts out of fragment auto-blocking (do not block). Links with #_dnb stay as normal links. */
const DNB_HASH = '#_dnb';

async function loadFragments(section) {
  const main = section.closest('main');
  const links = [...section.querySelectorAll('a[href*="/fragments/"]')]
    .filter((a) => !a.closest('.fragment'));
  const fragments = links.filter((a) => {
    if (a.href.includes(DNB_HASH)) {
      a.href = a.href.replace(DNB_HASH, '').replace(/#$/, '');
      return false;
    }
    return true;
  });
  if (fragments.length === 0) return;
  const { loadFragment } = await import('../blocks/fragment/fragment.js');
  await Promise.all(fragments.map(async (a) => {
    try {
      const { pathname } = new URL(a.href);
      const frag = await loadFragment(pathname);
      a.parentElement.replaceWith(...frag.children);
    } catch (error) {
      console.error('Fragment loading failed', error);
    }
  }));
  await dynamicBlocks(main);
}

function buildAutoBlocks(main) {
  try {
    buildEmbedBlocks(main);
    buildDynamicMediaImages(main);
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}

function loadErrorPage(main) {
  if (window.errorCode === '404') {
    const fragmentPath = '/fragments/404';
    const fragmentLink = document.createElement('a');
    fragmentLink.href = fragmentPath;
    fragmentLink.textContent = fragmentPath;
    const fragment = buildBlock('fragment', [[fragmentLink]]);
    const section = main.querySelector('.section');
    if (section) section.replaceChildren(fragment);
  }
}

/**
 * Inline SVG icons that need to inherit currentColor (e.g. logo).
 * Replaces <img src="…/icon.svg"> with the actual <svg> element
 * so CSS color and light-dark() work across themes.
 * @param {Element} scope element tree to search within
 */
async function inlineColorIcons(scope) {
  const icons = scope.querySelectorAll('.icon.icon-logo img[src$=".svg"]');
  icons.forEach(async (img) => {
    try {
      const resp = await fetch(img.src);
      if (!resp.ok) return;
      const text = await resp.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = text;
      const svg = tmp.querySelector('svg');
      if (!svg) return;
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', img.alt || 'Logo');
      img.replaceWith(svg);
    } catch (e) { /* keep <img> fallback */ }
  });
}

export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  inlineColorIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

async function loadTemplate(main) {
  try {
    const template = getMetadata('template');
    if (template) {
      const mod = await import(`../templates/${template}/${template}.js`);
      loadCSS(`${window.hlx.codeBasePath}/templates/${template}/${template}.css`);
      if (mod.default) {
        await mod.default(main);
      }
    }
  } catch (error) {
     
    console.error('template loading failed', error);
  }
}

// --- Adobe Target (Delivery API) ---
const TARGET_CLIENT = 'anubhavs';
const TARGET_PROPERTY_TOKEN = '325f02f8-62db-9d98-b45c-969204c07bf7';
const TARGET_DELIVERY_URL = `https://${TARGET_CLIENT}.tt.omtrdc.net/rest/v1/delivery?client=${TARGET_CLIENT}`;

function isTargetEnabled() {
  if (getMetadata('target')) return true;
  const path = window.location.pathname.replace(/\/$/, '');
  return path === '' || path === '/index';
}

function getTargetSessionId() {
  const stored = sessionStorage.getItem('target-session-id');
  if (stored) return stored;
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem('target-session-id', sessionId);
  return sessionId;
}

function onDecoratedElement(fn) {
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
      || m.target.dataset.sectionStatus === 'loaded'
      || m.target.dataset.blockStatus === 'loaded')) {
      fn();
    }
  });
  const main = document.querySelector('main');
  if (main) {
    observer.observe(main, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-block-status', 'data-section-status'],
    });
  }
  observer.observe(document.body, { childList: true });
}

function toCssSelector(selector) {
  return selector.replace(/(\.\S+)?:eq\((\d+)\)/g, (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`);
}

function applyTargetAction(action) {
  const selector = action.cssSelector || toCssSelector(action.selector);
  const el = document.querySelector(selector);
  if (!el || action.content == null) return;
  const html = String(action.content);
  switch (action.type) {
    case 'setHtml':
    case 'setContent':
      el.innerHTML = html;
      break;
    case 'setText':
      el.textContent = html;
      break;
    case 'insertAfter':
    case 'insertBefore':
    case 'replaceWith':
      if (/<[^>]+>/.test(html)) {
        el.innerHTML = html;
      } else {
        el.textContent = html;
      }
      break;
    default:
      break;
  }
}

function applyTargetOptions(options = []) {
  options.forEach((option) => {
    option.content?.forEach((action) => applyTargetAction(action));
  });
}

async function fetchTargetOffers() {
  const sessionId = getTargetSessionId();
  const response = await fetch(`${TARGET_DELIVERY_URL}&sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      context: {
        channel: 'web',
        address: { url: window.location.href },
        browser: { host: window.location.hostname },
      },
      property: { token: TARGET_PROPERTY_TOKEN },
      execute: { pageLoad: {} },
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const tntId = data?.id?.tntId;
  if (typeof tntId === 'string') {
    sessionStorage.setItem('target-session-id', tntId.split('.')[0]);
  }
  return data;
}

async function getAndApplyTargetOffers() {
  try {
    const data = await fetchTargetOffers();
    const options = data?.execute?.pageLoad?.options;
    if (!options?.length) return;
    onDecoratedElement(() => applyTargetOptions(options));
  } catch (e) {
    // Target unavailable — page should still render
  }
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  applyTheme();
  const main = doc.querySelector('main');
  if (main) {
    if (window.isErrorPage) loadErrorPage(main);
    if (isExperimentationEnabled()) {
      const { loadEager: runEager } = await import('../plugins/experimentation/src/index.js');
      await runEager(document, { audiences: AUDIENCES }, getExperimentationContext());
    }
    decorateMain(main);
    document.body.classList.add('appear');
    if (isTargetEnabled()) {
      await getAndApplyTargetOffers();
    }
    await loadSection(main.querySelector('.section'), async (s) => {
      await waitForFirstImage(s);
      await loadFragments(s);
    });
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

async function loadLazy(doc) {
  const headerEl = doc.querySelector('header');
  const footerEl = doc.querySelector('footer');
  loadHeader(headerEl);
  const templateName = getMetadata('template');
  if (templateName) {
    await loadTemplate(doc, templateName);
  }

  const main = doc.querySelector('main');
  const sections = main ? [...main.querySelectorAll('div.section')] : [];
  for (let i = 0; i < sections.length; i += 1) {
    await loadSection(sections[i], loadFragments);
    if (i === 0 && sampleRUM.enhance) sampleRUM.enhance();
  }
  await dynamicBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(footerEl);

  /* Scroll reveal: sections below the viewport animate in as they enter */
  if (main && 'IntersectionObserver' in window) {
    const vH = window.innerHeight;
    const revealSections = [...main.querySelectorAll('.section')].filter((s) => {
      const { top } = s.getBoundingClientRect();
      return top > vH;
    });
    if (revealSections.length) {
      revealSections.forEach((s) => s.classList.add('will-reveal'));
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.classList.add('revealed');
          revealObserver.unobserve(target);
        });
      }, { rootMargin: '0px 0px -60px 0px' });
      revealSections.forEach((s) => revealObserver.observe(s));
    }
  }

  /* Header scroll shadow: add .scrolled class once user scrolls past nav height */
  const navWrapper = doc.querySelector('.nav-wrapper');
  if (navWrapper) {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 64;
    const scrollObserver = new IntersectionObserver(
      ([entry]) => navWrapper.classList.toggle('scrolled', !entry.isIntersecting),
      { rootMargin: `-${navH}px 0px 0px 0px` },
    );
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;';
    doc.body.prepend(sentinel);
    scrollObserver.observe(sentinel);
  }

  /* inline logo SVGs in header/footer once they are decorated */
  const waitAndInline = (el) => {
    const observer = new MutationObserver(() => {
      if (el.querySelector('.icon.icon-logo img[src$=".svg"]')) {
        observer.disconnect();
        inlineColorIcons(el);
      }
    });
    observer.observe(el, { childList: true, subtree: true });
  };
  waitAndInline(headerEl);
  waitAndInline(footerEl);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  if (isExperimentationEnabled()) {
    const { loadLazy: runLazy } = await import('../plugins/experimentation/src/index.js');
    await runLazy(document, { audiences: AUDIENCES }, getExperimentationContext());
  }

  const loadQuickEdit = async (...args) => {
    const { default: initQuickEdit } = await import('../tools/quick-edit/quick-edit.js');
    initQuickEdit(...args);
  };

  const addSidekickListeners = (sk) => {
    sk.addEventListener('custom:quick-edit', loadQuickEdit);
  };

  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    addSidekickListeners(sk);
  } else {
    // wait for sidekick to be loaded
    document.addEventListener('sidekick-ready', () => {
    // sidekick now loaded
      addSidekickListeners(document.querySelector('aem-sidekick'));
    }, { once: true });
  }
}

(() => {
  const hasQE = new URL(window.location.href).searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
})();

function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Called by aem-embed after decorateMain + block loading.
 * Runs project-specific post-decoration logic that would
 * normally happen in loadLazy (e.g. dynamic blocks).
 */
export async function decorateEmbed(main) {
  await dynamicBlocks(main);
}

export async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// UE Editor support before page load
if (/\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

if (!window.hlx?.suppressLoadPage) {
  loadPage();

  (async function loadDa() {
    const { searchParams } = new URL(window.location.href);
    if (searchParams.get('dapreview')) {
      import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
    }
    if (searchParams.get('daexperiment')) {
      import('https://da.live/nx/public/plugins/exp/exp.js');
    }
  }());

  if (document.querySelector('aem-sidekick')) {
    import('./sidekick.js');
  } else {
    document.addEventListener('sidekick-ready', () => {
      import('./sidekick.js');
    }, { once: true });
  }

  window.addEventListener('aem-theme-change', (e) => {
    applyTheme(e.detail?.theme);
  });
}