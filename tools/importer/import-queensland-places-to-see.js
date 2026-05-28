/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroDestinationParser from './parsers/hero-destination.js';
import carouselPortraitParser from './parsers/carousel-portrait.js';
import cardsMasonryParser from './parsers/cards-masonry.js';
import heroNewsletterParser from './parsers/hero-newsletter.js';

// TRANSFORMER IMPORTS
import queenslandCleanupTransformer from './transformers/queensland-cleanup.js';
import queenslandSectionsTransformer from './transformers/queensland-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-destination': heroDestinationParser,
  'carousel-portrait': carouselPortraitParser,
  'cards-masonry': cardsMasonryParser,
  'hero-newsletter': heroNewsletterParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'queensland-places-to-see',
  urls: ['https://www.queensland.com/au/en/places-to-see'],
  description: 'Queensland Tourism places-to-see category page with hero banner, destination carousel, editorial text, masonry article cards, experience carousel, and newsletter signup',
  blocks: [
    {
      name: 'hero-destination',
      instances: ['section#hero-banner-slider'],
    },
    {
      name: 'carousel-portrait',
      instances: [
        'section#--wrapper',
        'section#choose-your-experience-wrapper',
      ],
    },
    {
      name: 'cards-masonry',
      instances: ['section#masonry-grid-article-wrapper'],
    },
    {
      name: 'hero-newsletter',
      instances: ["section[id='-']"],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: 'section#hero-banner-slider',
      style: 'dark',
      blocks: ['hero-destination'],
      defaultContent: [],
    },
    {
      id: 'section-2-destinations-carousel',
      name: 'Explore Queensland Carousel',
      selector: 'section#--wrapper',
      style: null,
      blocks: ['carousel-portrait'],
      defaultContent: ['h2#--heading'],
    },
    {
      id: 'section-3-editorial',
      name: 'Editorial Description',
      selector: '#editorial-description-wrapper',
      style: null,
      blocks: [],
      defaultContent: ['#editorial-description-wrapper h2', '#editorial-description-wrapper p'],
    },
    {
      id: 'section-4-masonry-articles',
      name: 'Article Grid',
      selector: 'section#masonry-grid-article-wrapper',
      style: null,
      blocks: ['cards-masonry'],
      defaultContent: ['h2#masonry-grid-article-header'],
    },
    {
      id: 'section-5-experiences-carousel',
      name: 'Choose Your Experience',
      selector: 'section#choose-your-experience-wrapper',
      style: null,
      blocks: ['carousel-portrait'],
      defaultContent: ['h2#choose-your-experience-heading'],
    },
    {
      id: 'section-6-newsletter',
      name: 'Newsletter Signup',
      selector: "section[id='-']",
      style: 'dark',
      blocks: ['hero-newsletter'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  queenslandCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [queenslandSectionsTransformer]
    : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path — output to /places-to-see
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/^\/au\/en/, '')
        .replace(/\/$/, '')
        .replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
