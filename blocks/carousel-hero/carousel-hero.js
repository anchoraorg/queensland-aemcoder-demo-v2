import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  /* Split subtitle/title headings (e.g. "Outback Queenslandis something else") */
  const heading = slide.querySelector('h1');
  if (heading) {
    const text = heading.textContent;
    const match = text.match(/^(.+?)(is something else)$/i);
    if (match) {
      const subtitle = document.createElement('span');
      subtitle.className = 'carousel-hero-subtitle';
      subtitle.textContent = match[1].trim();

      const title = document.createElement('span');
      title.className = 'carousel-hero-title';
      title.textContent = match[2];

      heading.textContent = '';
      heading.appendChild(subtitle);
      heading.appendChild(title);
    }
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let autoplayInterval = null;

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
}

function startAutoplay(block) {
  stopAutoplay();
  autoplayInterval = setInterval(() => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  }, 6000);
}

let carouselHeroId = 0;
export default async function decorate(block) {
  carouselHeroId += 1;
  block.setAttribute('id', `carousel-hero-${carouselHeroId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselHeroId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  /* Hero action buttons (play/pause + bookmark) */
  if (!isSingleSlide) {
    const actions = document.createElement('div');
    actions.classList.add('carousel-hero-actions');

    const playBtn = document.createElement('button');
    playBtn.classList.add('carousel-hero-play');
    playBtn.setAttribute('type', 'button');
    playBtn.setAttribute('aria-label', 'Pause slideshow');
    playBtn.addEventListener('click', () => {
      if (playBtn.classList.contains('paused')) {
        playBtn.classList.remove('paused');
        playBtn.setAttribute('aria-label', 'Pause slideshow');
        startAutoplay(block);
      } else {
        playBtn.classList.add('paused');
        playBtn.setAttribute('aria-label', 'Play slideshow');
        stopAutoplay();
      }
    });

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.classList.add('carousel-hero-bookmark');
    bookmarkBtn.setAttribute('type', 'button');
    bookmarkBtn.setAttribute('aria-label', 'Bookmark this page');

    actions.append(playBtn, bookmarkBtn);
    container.append(actions);

    bindEvents(block);
    startAutoplay(block);
  }

  /* Discover section below hero */
  const discoverSection = document.createElement('div');
  discoverSection.classList.add('carousel-hero-discover');
  discoverSection.innerHTML = `
    <h2>Discover Queensland's Icons</h2>
    <p>Dive headfirst into the <a href="/au/en/places-to-see/experiences/great-barrier-reef">Great Barrier Reef</a>, kick back on beaches that'll have your camera working overtime, soar above <a href="/au/en/places-to-see/experiences/nature-and-wildlife">rainforests</a> older than your family tree, and toast to sunset views with a cocktail in hand. <a href="/au/en/plan-your-holiday/road-trips">Road trip?</a> Absolutely. Starry nights, wild sights, and more detours than you planned (the good kind).</p>
    <p>Queensland doesn't just do holidays - it does the kind you'll brag about forever. Ready when you are.</p>
  `;
  block.append(discoverSection);
}
