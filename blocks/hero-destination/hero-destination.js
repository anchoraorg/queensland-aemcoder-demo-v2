export default function decorate(block) {
  const h1 = block.querySelector('h1');
  if (h1) {
    const text = h1.textContent.trim();
    const parts = text.split(/Places to/i);
    if (parts.length === 2) {
      h1.innerHTML = `<span class="hero-title-line1">${parts[0].trim()}</span><span class="hero-title-line2">Places to${parts[1]}</span>`;
    }
    const imageCol = block.querySelector(':scope > div > div:first-child');
    if (imageCol) imageCol.appendChild(h1);
  }

  // Add "Explore Queensland" heading before the next carousel-portrait
  const section = block.closest('.section');
  if (section) {
    const carousel = section.querySelector('.carousel-portrait-wrapper');
    if (carousel) {
      const heading = document.createElement('h2');
      heading.id = 'explore-queensland';
      heading.textContent = 'Explore Queensland';
      carousel.prepend(heading);
    }
  }
}
