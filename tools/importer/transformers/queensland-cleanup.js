/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Queensland cleanup.
 * Selectors from captured DOM of https://www.queensland.com/au/en/home
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent, overlays, and interactive widgets from captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '[class*="consent"]',
      '.sc-fKEBWA',
      '[id*="drift"]',
      '[id*="chat"]',
    ]);
  }
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable content: header, footer, nav, breadcrumbs
    // Header: <header id="header-menu2"> from captured DOM
    // Footer: <footer class="sc-ggOjCS"> from captured DOM
    WebImporter.DOMUtils.remove(element, [
      'header#header-menu2',
      'header',
      'footer.sc-ggOjCS',
      'footer',
      'nav',
      '[class*="breadcrumb"]',
      'iframe',
      'link',
      'noscript',
      'script',
    ]);
    // Remove tracking pixels (Yahoo, analytics beacons)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('sp.analytics.yahoo.com') || src.includes('pixel') || img.alt === 'dot image pixel') {
        const parent = img.closest('picture') || img.closest('p') || img;
        if (parent.parentNode) parent.parentNode.removeChild(parent);
      }
    });
    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-analytics');
    });
  }
}
