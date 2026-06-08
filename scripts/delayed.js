// Delayed functionality – martech
import { loadScript } from './aem.js';

const ADOBE_LAUNCH_URL = 'https://assets.adobedtm.com/7236b01c616f/62bbba279dd2/launch-390968a87a21.min.js';

async function loadAdobeLaunch() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  return loadScript(ADOBE_LAUNCH_URL, { async: '' });
}

async function loadCloudflareAnalytics() {
  if (!window.location.hostname.includes('bbird.live')) return;

  return loadScript('https://static.cloudflareinsights.com/beacon.min.js', {
    defer: true,
    'data-cf-beacon': '{"token": "6e52f24c204942e89f9b897c49e769d6"}',
  });
}

async function init() {
  await Promise.all([
    loadAdobeLaunch(),
    loadCloudflareAnalytics(),
  ]);
}

init();
