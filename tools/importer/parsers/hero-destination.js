/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-destination. Base: hero.
 * Source: https://www.queensland.com/au/en/places-to-see
 * Selectors from captured DOM: section#hero-banner-slider
 * Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Destination landing hero with full-width background image, heading, and description paragraph
 */
export default function parse(element, { document }) {
  const cells = [];

  // Image: background hero image from the figure
  const img = element.querySelector('figure img[src]:not([src=""])');

  // Heading: two-line h1 with spans "Queensland's Best" + "Places to Visit"
  // Multiple h1 elements exist; find the one that contains visible text spans
  const allH1s = element.querySelectorAll('h1');
  let h1 = null;
  for (const candidate of allH1s) {
    if (candidate.querySelector('span') && candidate.textContent.trim().length > 0) {
      h1 = candidate;
      break;
    }
  }
  // Description paragraph inside the text overlay area
  const descriptionEl = element.querySelector('.sc-dNFkOE p, .sc-llNjLw p');

  // Build image cell with field hint
  const imageCell = [];
  if (img) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(img);
    imageCell.push(imgFrag);
  }

  // Build text cell with field hint
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));

  if (h1) {
    // Reconstruct heading from spans
    const newH1 = document.createElement('h1');
    const spans = h1.querySelectorAll('span');
    if (spans.length > 0) {
      newH1.textContent = Array.from(spans).map((s) => s.textContent.trim()).join(' ');
    } else {
      newH1.textContent = h1.textContent.trim();
    }
    textFrag.appendChild(newH1);
  }

  if (descriptionEl) {
    const p = document.createElement('p');
    p.textContent = descriptionEl.textContent.trim();
    textFrag.appendChild(p);
  }

  cells.push([imageCell.length ? imageCell : '', [textFrag]]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-destination', cells });
  element.replaceWith(block);
}
