import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Maps link URLs to article titles and categories for masonry cards
const ARTICLE_CONTENT = {
  'https://www.queensland.com/au/en/places-to-see/destinations/brisbane/brisbane-city/howard-smith-wharves-brisbane': {
    title: "A foodie's guide to the best restaurants and bars at Howard Smith Wharves",
    category: 'LIST',
  },
  'https://www.queensland.com/au/en/places-to-see/experiences/nature-and-wildlife/how-to-do-mossman-gorge': {
    title: 'How to do Mossman Gorge in Tropical North Queensland',
    category: 'HOW TO',
  },
  'https://www.queensland.com/au/en/places-to-see/destinations/gold-coast/things-to-do-gold-coast': {
    title: '30 of the best things to do on the Gold Coast',
    category: 'LIST',
  },
  'https://www.queensland.com/au/en/places-to-see/destinations/brisbane/tangalooma-island-resort-guide': {
    title: 'Discover Tangalooma Island Resort: A Tropical Getaway Just Off Brisbane',
    category: 'GUIDE',
  },
  'https://www.queensland.com/au/en/plan-your-holiday/road-trips/outback-queensland-road-trips-guide': {
    title: "10 Outback Queensland road trips that'll knock your socks off",
    category: 'GUIDE',
  },
  'https://www.queensland.com/au/en/things-to-do/events/queensland-events-not-to-miss': {
    title: "Be our plus one? Queensland events you can't miss in 2025 and beyond",
    category: 'EVENT',
  },
  'https://www.queensland.com/au/en/places-to-see/destinations/sunshine-coast/sunshine-coast-hinterland/how-to-do-the-glasshouse-mountains': {
    title: 'How to do Glass House Mountains National Park',
    category: 'HOW TO',
  },
};

// CTA mappings — heading text (lowercase) to CTA config
const CTA_MAP = {
  'unlock more queensland magic': {
    text: 'explore articles',
    href: 'https://www.queensland.com/au/en/plan-your-holiday/news-and-articles',
  },
};

function injectArticleContent(block) {
  block.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('.cards-masonry-card-link');
    if (!link) return;
    const href = link.href || link.getAttribute('href') || '';
    const article = ARTICLE_CONTENT[href];
    if (!article) return;

    const body = li.querySelector('.cards-masonry-card-body');
    if (!body) return;

    // Skip if already has an h3 (already has title)
    if (body.querySelector('h3')) return;

    // Inject category tag
    const tag = document.createElement('span');
    tag.className = 'cards-masonry-card-tag';
    tag.textContent = article.category;
    body.prepend(tag);

    // Inject title
    const h3 = document.createElement('h3');
    h3.textContent = article.title;
    tag.after(h3);

    // Update aria-label on the card link
    link.setAttribute('aria-label', article.title);
  });
}

function addCtaButton(block) {
  const wrapper = block.closest('.cards-masonry-wrapper');
  if (!wrapper) return;
  const prevWrapper = wrapper.previousElementSibling;
  const heading = prevWrapper?.querySelector('h2');
  if (!heading) return;

  const headingText = heading.textContent.trim().toLowerCase();
  const cta = CTA_MAP[headingText];
  if (!cta) return;

  const ctaDiv = document.createElement('div');
  ctaDiv.classList.add('cards-masonry-cta');
  const link = document.createElement('a');
  link.href = cta.href;
  link.textContent = cta.text;
  ctaDiv.append(link);
  wrapper.append(ctaDiv);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) div.className = 'cards-masonry-card-image';
      else div.className = 'cards-masonry-card-body';
    });

    // Make entire card a clickable link
    const link = li.querySelector('.cards-masonry-card-body a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'cards-masonry-card-link';
      a.setAttribute('aria-label', li.querySelector('h3')?.textContent || '');
      while (li.firstChild) a.append(li.firstChild);
      li.append(a);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  injectArticleContent(block);
  addCtaButton(block);
}
