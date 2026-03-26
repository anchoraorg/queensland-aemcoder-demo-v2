import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Convert links whose href looks like an image URL into <img> elements.
 * AEM content delivery sometimes converts external image URLs to <a> tags.
 */
function convertImageLinks(container) {
  container.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (/\.(png|jpg|jpeg|gif|svg|webp)/i.test(href) || /scene7\.com/i.test(href)) {
      const img = document.createElement('img');
      img.src = href;
      img.alt = '';
      img.loading = 'lazy';
      const p = a.closest('p') || a.parentElement;
      if (p) {
        p.replaceChild(img, a);
      }
    }
  });
}

/**
 * Restructure temperature paragraphs (Min, °, Max, °) into an inline row.
 * Original site displays: Min 20° Max 26°
 * AEM content may have: <p>Min</p><p>°</p><p>Max</p><p>°</p>
 * or with numbers: <p>Min</p><p>20</p><p>°</p><p>Max</p><p>26</p><p>°</p>
 */
function restructureTemperatures(body) {
  const paragraphs = [...body.querySelectorAll('p')];
  const minIdx = paragraphs.findIndex((p) => p.textContent.trim() === 'Min');
  if (minIdx === -1) return;

  // Collect all temperature paragraphs from Min onwards
  const tempParagraphs = paragraphs.slice(minIdx);
  const tempRow = document.createElement('div');
  tempRow.className = 'temp-row';

  let currentLabel = null;
  let hasNumber = false;

  tempParagraphs.forEach((p) => {
    const text = p.textContent.trim();
    if (text === 'Min' || text === 'Max') {
      const label = document.createElement('span');
      label.className = 'temp-label';
      label.textContent = text;
      tempRow.append(label);
      currentLabel = text;
      hasNumber = false;
    } else if (text === '°') {
      if (!hasNumber && currentLabel) {
        // No number was found between label and degree — just show degree
      }
      const degree = document.createElement('span');
      degree.className = 'temp-degree';
      degree.textContent = '°';
      tempRow.append(degree);
    } else if (/^\d+$/.test(text)) {
      const value = document.createElement('span');
      value.className = 'temp-value';
      value.textContent = text;
      tempRow.append(value);
      hasNumber = true;
    }
    p.remove();
  });

  body.append(tempRow);
}

export default function decorate(block) {
  // Fix image links before processing
  convertImageLinks(block);

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) {
        div.className = 'cards-info-card-image';
      } else {
        div.className = 'cards-info-card-body';
      }
    });

    // Restructure temperature display in body divs
    const body = li.querySelector('.cards-info-card-body');
    if (body) {
      restructureTemperatures(body);
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
}
