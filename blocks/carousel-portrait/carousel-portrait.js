import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-portrait');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-portrait-slide');

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

  const indicators = block.querySelectorAll('.carousel-portrait-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-portrait-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-portrait-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function createScrollbar(block) {
  const slidesEl = block.querySelector('.carousel-portrait-slides');
  if (!slidesEl) return;

  const scrollbar = document.createElement('div');
  scrollbar.classList.add('carousel-portrait-scrollbar');
  const drag = document.createElement('div');
  drag.classList.add('carousel-portrait-scrollbar-drag');
  scrollbar.append(drag);

  // Insert scrollbar after the slides container
  const container = block.querySelector('.carousel-portrait-slides-container');
  if (container) {
    container.after(scrollbar);
  } else {
    block.append(scrollbar);
  }

  function updateDrag() {
    const { scrollLeft, scrollWidth, clientWidth } = slidesEl;
    const scrollbarWidth = scrollbar.offsetWidth;
    const ratio = clientWidth / scrollWidth;
    const dragWidth = Math.max(scrollbarWidth * ratio, 40);
    const maxLeft = scrollbarWidth - dragWidth;
    const scrollRatio = scrollWidth - clientWidth > 0
      ? scrollLeft / (scrollWidth - clientWidth)
      : 0;
    drag.style.width = `${dragWidth}px`;
    drag.style.left = `${scrollRatio * maxLeft}px`;
  }

  slidesEl.addEventListener('scroll', updateDrag, { passive: true });
  // Initial position — use IntersectionObserver so offsetWidth is reliable
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateDrag();
        observer.disconnect();
      }
    });
  }, { threshold: 0 });
  observer.observe(scrollbar);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-portrait-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }

  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  const slidesEl = block.querySelector('.carousel-portrait-slides');

  if (prevBtn && slidesEl) {
    prevBtn.addEventListener('click', () => {
      slidesEl.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }
  if (nextBtn && slidesEl) {
    nextBtn.addEventListener('click', () => {
      slidesEl.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-portrait-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

// CTA button mappings — maps section heading text to CTA link
const CTA_MAP = {
  'be our plus one?': { text: 'More events', href: 'https://www.queensland.com/au/en/things-to-do/events' },
};

function addCtaButton(block) {
  const section = block.closest('.section');
  if (!section) return;

  // Find the heading preceding this block
  const wrapper = block.closest('.carousel-portrait-wrapper');
  const prevWrapper = wrapper?.previousElementSibling;
  const heading = prevWrapper?.querySelector('h2');
  if (!heading) return;

  const headingText = heading.textContent.trim().toLowerCase();
  const cta = CTA_MAP[headingText];
  if (!cta) return;

  const ctaDiv = document.createElement('div');
  ctaDiv.classList.add('carousel-portrait-cta');
  const link = document.createElement('a');
  link.href = cta.href;
  link.textContent = cta.text;
  ctaDiv.append(link);
  wrapper.append(ctaDiv);
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-portrait-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-portrait-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-portrait-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselPortraitId = 0;
export default async function decorate(block) {
  carouselPortraitId += 1;
  block.setAttribute('id', `carousel-portrait-${carouselPortraitId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-portrait-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-portrait-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-portrait-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-portrait-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselPortraitId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-portrait-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    createScrollbar(block);
  }

  addCtaButton(block);
}
