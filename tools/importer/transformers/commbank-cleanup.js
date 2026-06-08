/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: CommBank site-wide cleanup.
 * Removes non-authorable content (header, footer, modals, overlays, tracking).
 * Selectors sourced from captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove modals/overlays that could interfere with block parsing
    // Found in captured HTML: <div class="page-lockout "> (line 2)
    // Found in captured HTML: <div id="logonOverlay"> (line 79)
    // Found in captured HTML: <div id="logonDialog"> (line 82)
    // Found in captured HTML: <div id="hamDialog"> (line 116)
    // Found in captured HTML: <div id="dialog1"> (line 163)
    WebImporter.DOMUtils.remove(element, [
      '.page-lockout',
      '#logonOverlay',
      '#logonDialog',
      '#hamDialog',
      '#dialog1',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site shell content
    // Found in captured HTML: <div class="skip-links-module"> (line 4)
    // Found in captured HTML: <header> ... </header> (lines 28-274)
    // Found in captured HTML: <div class="commbank-footer"> (line 1045)
    // Found in captured HTML: <div class="cloudservice testandtarget"> (line 1167)
    // Found in captured HTML: <div class="cloudservice datacollection"> (line 1170)
    // Found in captured HTML: <iframe> (lines 612, 1171)
    // Found in captured HTML: <div id="focus-announcer" class="sr-only"> (line 1173)
    WebImporter.DOMUtils.remove(element, [
      '.skip-links-module',
      'header',
      '.commbank-footer',
      '.cloudservice',
      'iframe',
      '#focus-announcer',
    ]);

    // Remove tracking/analytics attributes from all elements
    element.querySelectorAll('[data-track]').forEach((el) => {
      el.removeAttribute('data-track');
    });
    element.querySelectorAll('[onclick]').forEach((el) => {
      el.removeAttribute('onclick');
    });
  }
}
