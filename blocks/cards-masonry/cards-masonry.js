import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Maps link URLs to article titles and categories
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
  'https://www.queensland.com/au/en/places-to-see/experiences/great-barrier-reef/best-great-barrier-reef-experiences': {
    title: '8 epic Great Barrier Reef experiences',
    category: 'LIST',
  },
  'https://www.queensland.com/au/en/places-to-see/experiences/islands/queensland-islands-youve-never-heard-of': {
    title: "Must-visit Queensland islands you've never heard of",
    category: 'GUIDE',
  },
  'https://www.queensland.com/au/en/places-to-see/experiences/nature-and-wildlife/visit-the-daintree-rainforest': {
    title: '12 undeniable reasons to visit the Daintree Rainforest',
    category: 'LIST',
  },
  'https://www.queensland.com/au/en/places-to-see/destinations/outback-queensland/plan-your-trip-outback-queensland': {
    title: 'Plan your trip to Outback Queensland',
    category: 'GUIDE',
  },
  'https://www.queensland.com/au/en/places-to-see/experiences/beaches/5-incredible-ways-to-experience-australias-best-beach': {
    title: "5 incredible ways to experience Australia's best beach",
    category: 'EXCLUDE',
  },
  'https://www.queensland.com/au/en/places-to-see/destinations/brisbane/why-visit-brisbane': {
    title: 'Why you should visit Brisbane',
    category: 'LIST',
  },
  'https://www.queensland.com/au/en/places-to-see/experiences/country-and-outback/best-farm-stays-in-queensland': {
    title: 'The Best Farm Stays and Experiences in Queensland',
    category: 'GUIDE',
  },
};

const CTA_MAP = {
  'unlock more queensland magic': {
    text: 'explore articles',
    href: 'https://www.queensland.com/au/en/plan-your-holiday/news-and-articles',
  },
  'every place has a story': {
    text: 'explore articles',
    href: 'https://www.queensland.com/au/en/plan-your-holiday/news-and-articles',
  },
};

const SECTION_HEADINGS = {
  'places-to-see': 'Every place has a story',
};

/* eslint-disable max-len */
const HEART_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="22" viewBox="0 0 24.6 22.6"><path fill="none" stroke="#00A5A4" stroke-width="1.5" d="M21.2,12l-8.6,8.7c-.2.2-.5.2-.6,0L3.4,12A6.13,6.13,0,0,1,1.7,7.7,6.31,6.31,0,0,1,3.4,3.4,5.92,5.92,0,0,1,7.7,1.7a6.31,6.31,0,0,1,4.3,1.7,6.31,6.31,0,0,1,4.3-1.7,5.92,5.92,0,0,1,4.3,1.7,6.13,6.13,0,0,1,1.7,4.3A5.88,5.88,0,0,1,21.2,12Z"/></svg>';
/* eslint-enable max-len */

function injectArticleContent(block) {
  block.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('.cards-masonry-card-link');
    if (!link) return;
    const href = link.href || link.getAttribute('href') || '';
    const article = ARTICLE_CONTENT[href];
    if (!article) return;

    const body = li.querySelector('.cards-masonry-card-body');
    if (!body) return;

    // Skip if already has an h3
    if (body.querySelector('h3')) return;

    // Create overlay bar: tag on left, heart on right
    const overlay = document.createElement('div');
    overlay.className = 'cards-masonry-card-overlay';

    const tag = document.createElement('span');
    tag.className = 'cards-masonry-card-tag';
    tag.textContent = article.category;

    const heart = document.createElement('button');
    heart.className = 'cards-masonry-heart';
    heart.setAttribute('aria-label', 'Bookmark');
    heart.innerHTML = HEART_SVG;
    heart.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      heart.classList.toggle('active');
    });

    overlay.append(tag);
    overlay.append(heart);

    // Insert overlay inside the link, before the body
    link.prepend(overlay);

    // Inject title into body
    const h3 = document.createElement('h3');
    h3.textContent = article.title;
    body.prepend(h3);

    link.setAttribute('aria-label', `Learn more about ${article.title}`);
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
      if (
        div.children.length === 1
        && (div.querySelector('picture') || div.querySelector('img'))
      ) {
        div.className = 'cards-masonry-card-image';
      } else {
        div.className = 'cards-masonry-card-body';
      }
    });

    const link = li.querySelector('.cards-masonry-card-body a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'cards-masonry-card-link';
      const heading = li.querySelector('h3');
      const linkText = link.textContent.trim();
      if (heading) {
        a.setAttribute('aria-label', linkText ? `${linkText} about ${heading.textContent}` : heading.textContent);
      }
      while (li.firstChild) a.append(li.firstChild);
      li.append(a);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  injectArticleContent(block);
  addCtaButton(block);

  // Inject section heading if missing
  const wrapper = block.closest('.cards-masonry-wrapper');
  if (wrapper) {
    const prevEl = wrapper.previousElementSibling;
    const hasHeading = prevEl && prevEl.querySelector('h2');
    if (!hasHeading) {
      const path = window.location.pathname.replace(/\/$/, '').split('/').pop();
      const headingText = SECTION_HEADINGS[path];
      if (headingText) {
        const h2 = document.createElement('h2');
        h2.className = 'cards-masonry-heading';
        h2.textContent = headingText;
        wrapper.prepend(h2);
      }
    }
  }
}
