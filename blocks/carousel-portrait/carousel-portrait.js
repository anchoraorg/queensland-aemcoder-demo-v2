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
  // Double-rAF ensures layout is computed before reading offsetWidth
  requestAnimationFrame(() => requestAnimationFrame(updateDrag));
}

// Region data for the Queensland map — maps slide heading to SVG data-region
// and provides marker coordinates in SVG viewBox (0 0 1370 840)
const REGION_MAP = {
  brisbane: { region: 'Brisbane', cx: 1297, cy: 582 },
  'gold coast': { region: 'Gold-Coast', cx: 1309, cy: 602 },
  'sunshine coast': { region: 'Sunshine-Coast', cx: 1287, cy: 549 },
  'the whitsundays': { region: 'The-Whitsundays', cx: 1141, cy: 363 },
  'cairns & great barrier reef': { region: 'Tropical-North-Queensland', cx: 962, cy: 183 },
  'southern great barrier reef': { region: 'Southern-Great-Barrier-Reef', cx: 1239, cy: 473 },
  'fraser coast': { region: 'Fraser-Coast', cx: 1292, cy: 514 },
  'great barrier reef': { region: 'Great-Barrier-Reef', cx: 1146, cy: 244 },
  'mackay isaac': { region: 'Mackay-region', cx: 1142, cy: 408 },
  'outback queensland': { region: 'Outback-Queensland', cx: 1032, cy: 471 },
  'queensland country': { region: 'Southern-Queensland-Country', cx: 1194, cy: 533 },
  townsville: { region: 'Townsville-North-Queensland', cx: 1084, cy: 346 },
};

function updateMapRegion(block, slideIndex) {
  const svg = block.closest('.carousel-portrait-wrapper')
    ?.querySelector('.featured-map-container svg');
  if (!svg) return;

  const slides = block.querySelectorAll('.carousel-portrait-slide');
  const slide = slides[slideIndex];
  if (!slide) return;

  const heading = slide.querySelector('h1');
  const headingText = heading?.textContent?.trim()?.toLowerCase() || '';
  const regionInfo = REGION_MAP[headingText];
  if (!regionInfo) return;

  // Toggle inactive teal overlay paths:
  // - Current region's inactive path → opacity 0 (reveals artwork beneath)
  // - All other inactive paths → opacity 1 (solid teal covers artwork)
  const inactivePaths = svg.querySelectorAll('#map-0-Regions path.inactive');
  inactivePaths.forEach((path) => {
    const isCurrentRegion = path.getAttribute('data-region') === regionInfo.region;
    path.style.opacity = isCurrentRegion ? '0' : '1';
  });
}

async function setupFeaturedLayout(block) {
  const wrapper = block.closest('.carousel-portrait-wrapper');
  if (!wrapper) return;

  // Create the two-column layout container
  const twoCol = document.createElement('div');
  twoCol.classList.add('featured-layout');

  // --- Left: Map container ---
  const mapContainer = document.createElement('div');
  mapContainer.classList.add('featured-map-container');

  const mapClipper = document.createElement('div');
  mapClipper.classList.add('featured-map-clipper');

  // Load the SVG map
  try {
    const resp = await fetch(`${window.hlx?.codeBasePath || ''}/blocks/carousel-portrait/queensland-map.svg`);
    if (resp.ok) {
      const svgText = await resp.text();
      mapClipper.innerHTML = svgText;

      // Add a marker circle to the SVG
      // SVG has 24 paths: 12 "active" (artwork fill) + 12 "inactive" (teal overlay)
      // The inactive paths sit on top and hide the artwork.
      // On slide change, the current region's inactive path gets opacity 0
      // to reveal the artwork beneath. All other inactive paths stay opaque.
    }
  } catch (e) {
    // SVG load failed — map won't show, carousel still works
  }

  mapContainer.appendChild(mapClipper);

  // Artist credit
  const credit = document.createElement('p');
  credit.classList.add('featured-map-credit');
  credit.textContent = "Artist: Brian 'Binna' Swindley";
  mapContainer.appendChild(credit);

  // --- Right: Carousel container ---
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('featured-carousel-container');

  // Move existing block content into the carousel container
  while (block.firstChild) {
    carouselContainer.appendChild(block.firstChild);
  }

  // Inject inline SVG chevrons into featured nav buttons
  const chevronPath = 'M1.70365 0L0 1.7512 5.59271 7.5 0 13.24724 1.70365 15 9 7.5z';
  const chevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 15" width="9" height="15"><path fill="currentColor" fill-rule="evenodd" d="${chevronPath}"></path></svg>`;
  const prevBtnEl = carouselContainer.querySelector('.slide-prev');
  const nextBtnEl = carouselContainer.querySelector('.slide-next');
  if (prevBtnEl) prevBtnEl.innerHTML = `<span style="transform:scaleX(-1);display:flex">${chevronSvg}</span>`;
  if (nextBtnEl) nextBtnEl.innerHTML = `<span style="display:flex">${chevronSvg}</span>`;

  twoCol.appendChild(mapContainer);
  twoCol.appendChild(carouselContainer);
  block.appendChild(twoCol);
}

function bindFeaturedEvents(block) {
  const carouselContainer = block.querySelector('.featured-carousel-container');
  const root = carouselContainer || block;

  const prevBtn = root.querySelector('.slide-prev');
  const nextBtn = root.querySelector('.slide-next');
  const slides = root.querySelectorAll('.carousel-portrait-slide');
  let current = 0;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, slides.length - 1));
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== current);
      s.style.display = i === current ? '' : 'none';
    });
    if (prevBtn) prevBtn.style.display = current === 0 ? 'none' : 'flex';
    if (nextBtn) nextBtn.style.display = current === slides.length - 1 ? 'none' : 'flex';
    block.dataset.activeSlide = current;

    // Update scrollbar
    const scrollbar = root.querySelector('.carousel-portrait-scrollbar');
    if (scrollbar) {
      const drag = scrollbar.querySelector('.carousel-portrait-scrollbar-drag');
      if (drag) {
        const ratio = 1 / slides.length;
        const dragWidth = Math.max(scrollbar.offsetWidth * ratio, 40);
        const maxLeft = scrollbar.offsetWidth - dragWidth;
        drag.style.width = `${dragWidth}px`;
        drag.style.left = `${(current / (slides.length - 1)) * maxLeft}px`;
      }
    }

    // Update map region highlight
    updateMapRegion(block, current);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Initialise — show first slide only
  goTo(0);
}

function bindEvents(block) {
  if (block.classList.contains('featured')) {
    bindFeaturedEvents(block);
    return;
  }

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
      const slide = block.querySelector('.carousel-portrait-slide');
      const gap = parseFloat(getComputedStyle(slidesEl).gap) || 0;
      const scrollAmount = slide ? 4 * (slide.offsetWidth + gap) : 1200;
      slidesEl.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }
  if (nextBtn && slidesEl) {
    nextBtn.addEventListener('click', () => {
      const slide = block.querySelector('.carousel-portrait-slide');
      const gap = parseFloat(getComputedStyle(slidesEl).gap) || 0;
      const scrollAmount = slide ? 4 * (slide.offsetWidth + gap) : 1200;
      slidesEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

// Fallback images — maps card link URLs to Scene7 image URLs
// Used when AEM content has empty image columns
const FALLBACK_IMAGES = {
  // "Be our plus one?" — events carousel
  'https://www.queensland.com/au/en/things-to-do/events/arts-and-culture/blueys-world-brisbane': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/brisbane/blog-images/2023_BNE_BlueysWorld2.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  'https://www.queensland.com/au/en/things-to-do/events/arts-and-culture': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/brisbane/web-images/2021_BNE_QAGOMA_DLT_JesseSmith_Mobile.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  'https://www.queensland.com/au/en/things-to-do/events/endurance-events': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/events/2024_SC_Ironman_KV_IM703__0263.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  'https://www.queensland.com/au/en/things-to-do/events/food-and-drink': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/tropical-north-queensland/web-images/2019_TNQ_NuNuRestaurant_FoodandBeverage_138678_mobile.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  'https://www.queensland.com/au/en/things-to-do/events/music-and-festivals': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/sunshine-coast/web-images/2014_SSC_CaloundraMusicFestival_Festival_130867_desktop.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  'https://www.queensland.com/au/en/things-to-do/events/sports-events': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/brisbane/web-images/2020_BNE_BrisbaneInternational_SportEvents_141267_desktop.jpg?fit=crop&fmt=webp&hei=500&wid=270',
  // "Explore our destinations" — destination carousel
  'https://www.queensland.com/au/en/places-to-see/destinations/cairns-and-great-barrier-reef': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/tropical-north-queensland/web-images/2024_TNQ_Mossman_DaintreeRainfor-23.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/brisbane': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/brisbane/web-images/2022_BNE_KangarooPoint_149804.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/gold-coast': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/gold-coast/web-images/2022_GC_GoldCoastSkyline_150564.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/sunshine-coast': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/sunshine-coast/web-images/2022_SC_Noosa_Surfing1.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/southern-great-barrier-reef': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/bundaberg/blog-images/2022_BDB_LadyMusgraveExperience_MarkFitz_149305.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/the-whitsundays': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/the-whitsundays/blog-imges/2022_WYS_HeartReef_HamiltonIslandAir_149885-23.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/fraser-coast': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/fraser-coast/web-images/2023_FC_Kgri_Family_1549_Mobile.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/southern-queensland-country': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/southern-queensland-country/web-images/QC_2023_mountnormantrail.png?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/outback-queensland': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/outback-queensland/hero-banner/2020_OUT_dinosaurtrail_AdventureExperience.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/mackay': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/mackay/web-images/2024_MKY_Clermont_PeakRangeNatio-19.jpg?fit=crop&fmt=webp&hei=420&wid=270',
  'https://www.queensland.com/au/en/places-to-see/destinations/townsville': 'https://s7ap1.scene7.com/is/image/destqueensland/teq/consumer/global/images/destinations/townsville/web-images/2024_TSV_GirringunNationalPark_W-23.jpg?fit=crop&fmt=webp&hei=420&wid=270',
};

function injectFallbackImages(block) {
  block.querySelectorAll('.carousel-portrait-slide').forEach((slide) => {
    const imageCol = slide.querySelector('.carousel-portrait-slide-image');
    if (!imageCol || imageCol.querySelector('picture, img')) return;

    // Image column is empty — check for a matching fallback
    const link = slide.querySelector('.carousel-portrait-slide-content a');
    if (!link) return;

    const href = link.href || link.getAttribute('href') || '';
    const fallbackUrl = FALLBACK_IMAGES[href];
    if (!fallbackUrl) return;

    // Clear empty wrappers (e.g. <p><!-- field:media_image --></p>)
    imageCol.innerHTML = '';

    const img = document.createElement('img');
    img.src = fallbackUrl;
    img.alt = '';
    img.loading = 'lazy';
    imageCol.append(img);
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

function isFeaturedSection(block) {
  const wrapper = block.closest('.carousel-portrait-wrapper');
  const prev = wrapper?.previousElementSibling;
  const heading = prev?.querySelector('h2');
  if (heading && heading.textContent.trim().toLowerCase().includes('let us show you around')) {
    return true;
  }
  return false;
}

let carouselPortraitId = 0;
export default async function decorate(block) {
  carouselPortraitId += 1;
  block.setAttribute('id', `carousel-portrait-${carouselPortraitId}`);

  if (isFeaturedSection(block)) {
    block.classList.add('featured');
  }

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
    const chevronSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 15" width="9" height="15"><path fill="currentColor" fill-rule="evenodd" d="M1.70365 0L0 1.7512 5.59271 7.5 0 13.24724 1.70365 15 9 7.5z"></path></svg>';
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}">${chevronSvg}</button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}">${chevronSvg}</button>
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

  injectFallbackImages(block);

  if (!isSingleSlide) {
    if (block.classList.contains('featured')) {
      await setupFeaturedLayout(block);
      createScrollbar(block);
      bindEvents(block);
    } else {
      bindEvents(block);
      createScrollbar(block);
    }
  }

  addCtaButton(block);
}
