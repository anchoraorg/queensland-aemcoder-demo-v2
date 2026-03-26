import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

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
}
