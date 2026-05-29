/* eslint-disable max-len */
const HEART_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24.6 22.6"><path d="M21.2,12l-8.6,8.7c-.2.2-.5.2-.6,0L3.4,12A6.13,6.13,0,0,1,1.7,7.7,6.31,6.31,0,0,1,3.4,3.4,5.92,5.92,0,0,1,7.7,1.7a6.31,6.31,0,0,1,4.3,1.7,6.31,6.31,0,0,1,4.3-1.7,5.92,5.92,0,0,1,4.3,1.7,6.13,6.13,0,0,1,1.7,4.3A5.88,5.88,0,0,1,21.2,12Z"/></svg>';
/* eslint-enable max-len */

export default function decorate(block) {
  const h1 = block.querySelector('h1');
  if (h1) {
    const text = h1.textContent.trim();
    const parts = text.split(/Places to/i);
    if (parts.length === 2) {
      h1.innerHTML = `<span class="hero-title-line1">${parts[0].trim()}</span><span class="hero-title-line2">Places to${parts[1]}</span>`;
    }

    // Add heart below heading
    const heart = document.createElement('span');
    heart.className = 'hero-heart';
    heart.innerHTML = HEART_SVG;
    heart.addEventListener('click', (e) => {
      e.preventDefault();
      heart.classList.toggle('active');
    });
    h1.appendChild(heart);

    const imageCol = block.querySelector(':scope > div > div:first-child');
    if (imageCol) imageCol.appendChild(h1);
  }

  // Add "Explore Queensland" heading before the next carousel block
  const wrapper = block.closest('.hero-destination-wrapper');
  if (wrapper && wrapper.nextElementSibling) {
    const heading = document.createElement('h2');
    heading.className = 'explore-heading';
    heading.textContent = 'Explore Queensland';
    wrapper.parentElement.insertBefore(heading, wrapper.nextElementSibling);
  }
}
