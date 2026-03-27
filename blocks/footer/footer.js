import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_LINKS_COL1 = [
  { text: 'Homepage', href: '/au/en/home' },
  { text: 'About us', href: '/au/en/info/about-us' },
  { text: 'Privacy Policy', href: '/au/en/info/privacy-policy' },
  { text: 'Cookies policy', href: '/au/en/info/cookies_policy' },
  { text: 'Terms and Conditions', href: '/au/en/info/terms-and-conditions' },
  {
    text: 'Best of Queensland Experiences',
    href: '/au/en/info/best-of-queensland-experiences-program',
  },
];

const FOOTER_LINKS_COL2 = [
  { text: 'Preference centre', href: '/au/en/info/view-preferences' },
  { text: 'List your business', href: '/au/en/info/list-your-business' },
  {
    text: 'Advertising opportunities',
    href: '/au/en/info/advertising-opportunities',
  },
  { text: 'Your favourites', href: '/au/en/info/my-bookmarks' },
  { text: 'Industry site', href: 'https://teq.queensland.com/', ext: true },
];

/* eslint-disable max-len */
const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/queensland/', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 24" width="23" height="23"><path fill="currentColor" fill-rule="evenodd" d="M11.5 15.47c-2.117 0-3.833-1.732-3.833-3.868 0-2.136 1.716-3.867 3.833-3.867s3.833 1.731 3.833 3.867c0 2.136-1.716 3.868-3.833 3.868zM16.24.07c1.224.056 2.06.252 2.792.539a5.63 5.63 0 0 1 2.037 1.338 5.63 5.63 0 0 1 1.326 2.055c.284.738.479 1.581.535 2.816C22.987 8.056 23 8.452 23 11.603v.316c-.001 2.863-.015 3.273-.069 4.467-.056 1.235-.25 2.079-.535 2.817a5.63 5.63 0 0 1-1.326 2.055 5.63 5.63 0 0 1-2.037 1.338c-.731.287-1.567.483-2.791.539-1.142.053-1.56.068-4.133.07h-1.217c-2.573-.002-2.991-.017-4.133-.07-1.224-.056-2.06-.252-2.792-.539a5.63 5.63 0 0 1-2.037-1.338A5.63 5.63 0 0 1 .604 19.203c-.284-.738-.479-1.582-.535-2.817C.023 15.368.006 14.921.001 12.922v-2.805C.006 8.29.023 7.843.069 6.819c.056-1.235.25-2.078.535-2.816A5.63 5.63 0 0 1 1.93 1.948 5.63 5.63 0 0 1 3.967.61C4.698.323 5.534.127 6.758.07 7.774.023 8.217.006 10.11.001zM11.5 5.645c3.261 0 5.905 2.667 5.905 5.958 0 3.29-2.644 5.958-5.905 5.958-3.262 0-5.906-2.668-5.906-5.958 0-3.291 2.644-5.958 5.906-5.958zm6.139-1.628c.762 0 1.38.624 1.38 1.393s-.618 1.392-1.38 1.392c-.762 0-1.38-.623-1.38-1.392s.618-1.393 1.38-1.393z"/></svg>' },
  { label: 'Facebook', href: 'https://www.facebook.com/visitqueensland/', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="23" height="23"><path fill="currentColor" d="M21.2 40V21.8h6.4l1-7.1h-7.3v-4.6c0-2.1.6-3.5 3.7-3.5h3.9V.3c-.7-.1-3-.3-5.7-.3-5.6 0-9.6 3.3-9.6 9.4v5.2H7.2v7.1h6.4V40h7.6z"/></svg>' },
  { label: 'Twitter', href: 'https://twitter.com/Queensland', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="23" height="23"><path fill="currentColor" d="M40 7.3c-1.5.7-3.1 1.1-4.7 1.3 1.7-1 3-2.6 3.6-4.5-1.6.9-3.3 1.6-5.2 2-1.5-1.6-3.6-2.6-6-2.6-4.5 0-8.2 3.7-8.2 8.2 0 .6.1 1.3.2 1.9C12.9 13.2 6.8 10 2.8 5c-.7 1.2-1.1 2.6-1.1 4.1 0 2.8 1.4 5.4 3.7 6.8-1.3 0-2.6-.4-3.7-1v.1c0 4 2.8 7.3 6.6 8-.7.2-1.4.3-2.2.3-.5 0-1-.1-1.5-.1 1 3.3 4.1 5.6 7.7 5.7-3 2.2-6.5 3.5-10.3 3.5-.7 0-1.3 0-2-.1C3.6 34.6 7.9 36 12.6 36c15.1 0 23.3-12.5 23.3-23.3v-1.1c1.6-1.2 3-2.6 4.1-4.3"/></svg>' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/Queensland', icon: '<svg viewBox="0 0 28 20" width="23" height="23"><g stroke="none" fill="none"><g transform="translate(-296 -822)" fill="currentColor"><g transform="translate(0 440)"><path d="M307.2 396.3V387.7l7.3 4.3-7.3 4.3zm16.2-11.2c-.3-1.2-1.3-2.2-2.5-2.5C318.8 382 310 382 310 382s-8.8 0-10.9.6c-1.2.3-2.2 1.3-2.5 2.5C296 387.4 296 392 296 392s0 4.6.6 6.9c.3 1.2 1.3 2.2 2.5 2.5 2.2.6 10.9.6 10.9.6s8.8 0 10.9-.6c1.2-.3 2.2-1.3 2.5-2.5.6-2.3.6-6.9.6-6.9s0-4.6-.6-6.9z"/></g></g></g></svg>' },
  { label: 'Email', href: 'mailto:info@queensland.com', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="23" height="23"><path fill="currentColor" stroke="currentColor" stroke-width="0.5" d="M34.1 12.8c.4.5.2 1.3-.3 1.7l-12.1 9.1c-.5.4-1.1.6-1.8.6-.6 0-1.2-.2-1.8-.6l-12-9.1c-.5-.4-.6-1.1-.3-1.7.4-.5 1.1-.7 1.6-.3l12.1 9.1c.3.2.6.2.9 0l12.1-9.1c.6-.3 1.3-.2 1.6.3zm3.6 17.1c0 1.5-1.2 2.8-2.6 2.8H4.9c-1.5 0-2.6-1.2-2.6-2.8V10.1c0-1.5 1.2-2.8 2.6-2.8h30.2c1.5 0 2.6 1.2 2.6 2.8v19.8zM35.1 5H4.9C2.2 5 0 7.3 0 10.1v19.7C0 32.7 2.2 35 4.9 35h30.2c2.7 0 4.9-2.3 4.9-5.1V10.1C40 7.3 37.8 5 35.1 5z"/></svg>' },
];
/* eslint-enable max-len */

const ACKNOWLEDGMENT = 'Tourism and Events Queensland acknowledges the Traditional '
  + 'Owners of Country and we recognise their continuing connection '
  + 'to land, waters, culture and community. We pay our respect to '
  + 'Elders past and present, and we value and respect Aboriginal '
  + 'and Torres Strait Islander cultures in all that we do.';

/* eslint-disable max-len */
const LOGO_TOURISM = 'https://www.queensland.com/content/dam/teq/consumer/global/footer-logos/logo-tourism.png';
const LOGO_QLD_GOV = 'https://www.queensland.com/content/dam/teq/consumer/global/footer-logos/logo-queensland-gov.png';
/* eslint-enable max-len */

function buildLink(text, href, external = false) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  if (external) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

function buildFooterContent() {
  const container = document.createElement('div');

  // ── TOP SECTION: Links ──
  const topSection = document.createElement('div');
  topSection.className = 'footer-top';

  const topInner = document.createElement('div');
  topInner.className = 'footer-top-inner';

  [FOOTER_LINKS_COL1, FOOTER_LINKS_COL2].forEach((col) => {
    const ul = document.createElement('ul');
    ul.className = 'footer-links';
    col.forEach(({ text, href, ext }) => {
      const li = document.createElement('li');
      li.append(buildLink(text, href, ext));
      ul.append(li);
    });
    topInner.append(ul);
  });

  topSection.append(topInner);
  container.append(topSection);

  // ── BOTTOM SECTION: Social + Acknowledgment + Logos ──
  const bottomSection = document.createElement('div');
  bottomSection.className = 'footer-bottom';

  const bottomInner = document.createElement('div');
  bottomInner.className = 'footer-bottom-inner';

  // Social icons (left)
  const socialDiv = document.createElement('div');
  socialDiv.className = 'footer-social';
  SOCIAL_LINKS.forEach(({ label, href, icon }) => {
    const a = document.createElement('a');
    a.href = href;
    a.setAttribute('aria-label', `Queensland ${label} account`);
    a.title = `Queensland ${label} account`;
    a.innerHTML = icon;
    socialDiv.append(a);
  });
  bottomInner.append(socialDiv);

  // Acknowledgment (center)
  const ackDiv = document.createElement('div');
  ackDiv.className = 'footer-acknowledgment';
  const ackP = document.createElement('p');
  ackP.textContent = ACKNOWLEDGMENT;
  ackDiv.append(ackP);
  bottomInner.append(ackDiv);

  // Logos + Copyright (right)
  const logosDiv = document.createElement('div');
  logosDiv.className = 'footer-logos';

  const logosRow = document.createElement('div');
  logosRow.className = 'footer-logos-row';

  const tourismImg = document.createElement('img');
  tourismImg.src = LOGO_TOURISM;
  tourismImg.alt = 'Tourism and Events Queensland';
  tourismImg.loading = 'lazy';
  logosRow.append(tourismImg);

  const separator = document.createElement('span');
  separator.className = 'footer-logo-separator';
  logosRow.append(separator);

  const govImg = document.createElement('img');
  govImg.src = LOGO_QLD_GOV;
  govImg.alt = 'Queensland Government';
  govImg.loading = 'lazy';
  logosRow.append(govImg);

  logosDiv.append(logosRow);

  const copyDiv = document.createElement('div');
  copyDiv.className = 'footer-copyright';
  copyDiv.textContent = 'Tourism & Events Queensland \u00A9';
  logosDiv.append(copyDiv);

  bottomInner.append(logosDiv);
  bottomSection.append(bottomInner);
  container.append(bottomSection);

  return container;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');

  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }

  // Inject enhanced footer content
  const enhanced = buildFooterContent();
  footer.textContent = '';
  footer.append(enhanced);

  block.append(footer);
}
