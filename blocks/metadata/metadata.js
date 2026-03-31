export default function decorate(block) {
  // Parse metadata key-value pairs and inject as meta tags
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length < 2) return;

    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (!key || !value) return;

    const isOg = key.startsWith('og:') || key.startsWith('twitter:');
    const attr = isOg ? 'property' : 'name';

    // Check if this meta tag already exists
    const existing = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (existing) {
      existing.setAttribute('content', value);
    } else if (key === 'title') {
      document.title = value;
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute(attr, key);
      meta.setAttribute('content', value);
      document.head.appendChild(meta);
    }
  });

  // Remove the block from the DOM
  const parent = block.closest('.section');
  if (parent) {
    parent.remove();
  }
}
