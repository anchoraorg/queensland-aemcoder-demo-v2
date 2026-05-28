/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-queensland-places-to-see.js
  var import_queensland_places_to_see_exports = {};
  __export(import_queensland_places_to_see_exports, {
    default: () => import_queensland_places_to_see_default
  });

  // tools/importer/parsers/hero-destination.js
  function parse(element, { document }) {
    const cells = [];
    const img = element.querySelector('figure img[src]:not([src=""])');
    const allH1s = element.querySelectorAll("h1");
    let h1 = null;
    for (const candidate of allH1s) {
      if (candidate.querySelector("span") && candidate.textContent.trim().length > 0) {
        h1 = candidate;
        break;
      }
    }
    const descriptionEl = element.querySelector(".sc-dNFkOE p, .sc-llNjLw p");
    const imageCell = [];
    if (img) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(img);
      imageCell.push(imgFrag);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (h1) {
      const newH1 = document.createElement("h1");
      const spans = h1.querySelectorAll("span");
      if (spans.length > 0) {
        newH1.textContent = Array.from(spans).map((s) => s.textContent.trim()).join(" ");
      } else {
        newH1.textContent = h1.textContent.trim();
      }
      textFrag.appendChild(newH1);
    }
    if (descriptionEl) {
      const p = document.createElement("p");
      p.textContent = descriptionEl.textContent.trim();
      textFrag.appendChild(p);
    }
    cells.push([imageCell.length ? imageCell : "", [textFrag]]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-destination", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-portrait.js
  function parse2(element, { document }) {
    const slides = element.querySelectorAll(".swiper-slide");
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector('img[src]:not([src=""])');
      const label = slide.querySelector("p");
      const heading = slide.querySelector("h1, h5, h3, h2");
      const link = slide.querySelector("a[href]");
      if (!img && !heading) return;
      const imageCell = [];
      if (img) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:media_image "));
        imgFrag.appendChild(img);
        imageCell.push(imgFrag);
      }
      const contentFrag = document.createDocumentFragment();
      contentFrag.appendChild(document.createComment(" field:content_text "));
      if (label) contentFrag.appendChild(label);
      if (heading) contentFrag.appendChild(heading);
      if (link && link !== (heading == null ? void 0 : heading.closest("a"))) {
        contentFrag.appendChild(link);
      } else if (link) {
        const newLink = document.createElement("a");
        newLink.href = link.href;
        newLink.textContent = heading ? heading.textContent : link.textContent;
        contentFrag.appendChild(newLink);
      }
      cells.push([imageCell.length ? imageCell : "", [contentFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-portrait", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-masonry.js
  function parse3(element, { document }) {
    const cardLinks = element.querySelectorAll('a[href][class*="dpouGB"], a[href][class*="eHqVIu"], a[href][class*="etsjJW"]');
    const cells = [];
    const items = cardLinks.length > 0 ? cardLinks : element.querySelectorAll("a[href]");
    items.forEach((card) => {
      var _a;
      const img = card.querySelector('img[src]:not([src=""])');
      const heading = card.querySelector("h3, h4, h5, h2");
      const titleSpan = card.querySelector('[class*="title"], [class*="fVHBlr"]');
      if (!img && !heading && !titleSpan) return;
      const imageCell = [];
      if (img) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(img);
        imageCell.push(imgFrag);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) {
        textFrag.appendChild(heading);
      } else if (titleSpan) {
        const h3 = document.createElement("h3");
        h3.textContent = titleSpan.textContent;
        textFrag.appendChild(h3);
      }
      const newLink = document.createElement("a");
      newLink.href = card.href;
      newLink.textContent = ((_a = heading || titleSpan) == null ? void 0 : _a.textContent) || "Learn more";
      textFrag.appendChild(newLink);
      cells.push([imageCell.length ? imageCell : "", [textFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-masonry", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-newsletter.js
  function parse4(element, { document }) {
    const cells = [];
    const img = element.querySelector('figure img[src]:not([src=""])');
    const heading = element.querySelector("h3, h2, h1");
    const description = element.querySelector("p.sc-cOpnSz, .sc-cSMkSB p");
    const ctaLink = element.querySelector("a[href]");
    const imageCell = [];
    if (img) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(img);
      imageCell.push(imgFrag);
    }
    const textCell = [];
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    if (ctaLink) {
      const newLink = document.createElement("a");
      newLink.href = ctaLink.href;
      newLink.textContent = ctaLink.textContent.trim();
      textFrag.appendChild(newLink);
    }
    textCell.push(textFrag);
    cells.push([imageCell.length ? imageCell : "", textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-newsletter", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/queensland-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="cookie"]',
        '[class*="consent"]',
        ".sc-fKEBWA",
        '[id*="drift"]',
        '[id*="chat"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header-menu2",
        "header",
        "footer.sc-ggOjCS",
        "footer",
        "nav",
        '[class*="breadcrumb"]',
        "iframe",
        "link",
        "noscript",
        "script"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
        el.removeAttribute("data-analytics");
      });
    }
  }

  // tools/importer/transformers/queensland-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      const matchedElements = /* @__PURE__ */ new Set();
      const sectionElements = [];
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        let sectionEl = null;
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        for (const sel of selectors) {
          try {
            const candidates = element.querySelectorAll(sel);
            for (const candidate of candidates) {
              if (!matchedElements.has(candidate)) {
                sectionEl = candidate;
                matchedElements.add(candidate);
                break;
              }
            }
            if (sectionEl) break;
          } catch (e) {
          }
        }
        sectionElements.push({ section, el: sectionEl, index: i });
      }
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { section, el } = sectionElements[i];
        if (!el) continue;
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          el.parentNode.insertBefore(metadataBlock, el.nextSibling);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
  }

  // tools/importer/import-queensland-places-to-see.js
  var parsers = {
    "hero-destination": parse,
    "carousel-portrait": parse2,
    "cards-masonry": parse3,
    "hero-newsletter": parse4
  };
  var PAGE_TEMPLATE = {
    name: "queensland-places-to-see",
    urls: ["https://www.queensland.com/au/en/places-to-see"],
    description: "Queensland Tourism places-to-see category page with hero banner, destination carousel, editorial text, masonry article cards, experience carousel, and newsletter signup",
    blocks: [
      {
        name: "hero-destination",
        instances: ["section#hero-banner-slider"]
      },
      {
        name: "carousel-portrait",
        instances: [
          "section#--wrapper",
          "section#choose-your-experience-wrapper"
        ]
      },
      {
        name: "cards-masonry",
        instances: ["section#masonry-grid-article-wrapper"]
      },
      {
        name: "hero-newsletter",
        instances: ["section[id='-']"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Banner",
        selector: "section#hero-banner-slider",
        style: "dark",
        blocks: ["hero-destination"],
        defaultContent: []
      },
      {
        id: "section-2-destinations-carousel",
        name: "Explore Queensland Carousel",
        selector: "section#--wrapper",
        style: null,
        blocks: ["carousel-portrait"],
        defaultContent: ["h2#--heading"]
      },
      {
        id: "section-3-editorial",
        name: "Editorial Description",
        selector: "#editorial-description-wrapper",
        style: null,
        blocks: [],
        defaultContent: ["#editorial-description-wrapper h2", "#editorial-description-wrapper p"]
      },
      {
        id: "section-4-masonry-articles",
        name: "Article Grid",
        selector: "section#masonry-grid-article-wrapper",
        style: null,
        blocks: ["cards-masonry"],
        defaultContent: ["h2#masonry-grid-article-header"]
      },
      {
        id: "section-5-experiences-carousel",
        name: "Choose Your Experience",
        selector: "section#choose-your-experience-wrapper",
        style: null,
        blocks: ["carousel-portrait"],
        defaultContent: ["h2#choose-your-experience-heading"]
      },
      {
        id: "section-6-newsletter",
        name: "Newsletter Signup",
        selector: "section[id='-']",
        style: "dark",
        blocks: ["hero-newsletter"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_queensland_places_to_see_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/^\/au\/en/, "").replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_queensland_places_to_see_exports);
})();
