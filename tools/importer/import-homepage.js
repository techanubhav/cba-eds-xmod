/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSupportParser from './parsers/hero-support.js';
import cardsNavParser from './parsers/cards-nav.js';
import columnsVideoParser from './parsers/columns-video.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsPromoParser from './parsers/cards-promo.js';
import columnsSupportParser from './parsers/columns-support.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/commbank-cleanup.js';
import dmImagesTransformer from './transformers/commbank-dm-images.js';
import sectionsTransformer from './transformers/commbank-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-support': heroSupportParser,
  'cards-nav': cardsNavParser,
  'columns-video': columnsVideoParser,
  'cards-article': cardsArticleParser,
  'cards-promo': cardsPromoParser,
  'columns-support': columnsSupportParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'CommBank main homepage with hero banner, product cards, and promotional content',
  urls: ['https://www.commbank.com.au/'],
  blocks: [
    {
      name: 'hero-support',
      instances: ['.hero-banner-module.homepage-banner'],
    },
    {
      name: 'cards-nav',
      instances: ['.six-packs-module .six-packs-wrapper'],
    },
    {
      name: 'columns-video',
      instances: ['.video-module.video-right'],
    },
    {
      name: 'cards-article',
      instances: ['.column-control#column-control-0 .four-column'],
    },
    {
      name: 'cards-promo',
      instances: ['.card-module-alt .card-combo'],
    },
    {
      name: 'columns-support',
      instances: ['.helpv2-module'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.container.hero-container',
      style: null,
      blocks: ['hero-support'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Product Navigation Grid',
      selector: '.homepage-six-pack',
      style: null,
      blocks: ['cards-nav'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Video Feature',
      selector: '.video-module.video-right',
      style: null,
      blocks: ['columns-video'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Article Cards',
      selector: '.column-control#column-control-0',
      style: null,
      blocks: ['cards-article'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Financial Difficulty CTA',
      selector: '.cta-module.title-on-left',
      style: null,
      blocks: [],
      defaultContent: ['.cta-module.title-on-left h2', '.cta-module.title-on-left .cta-wrapper'],
    },
    {
      id: 'section-6',
      name: 'More from CommBank',
      selector: '.cardsV2',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'Help Section',
      selector: '.helpv2-module',
      style: 'dark',
      blocks: ['columns-support'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'Disclaimers',
      selector: '.column-control#column-control-1',
      style: 'dark',
      blocks: [],
      defaultContent: ['.column-control#column-control-1 .header-content h2', '.column-control#column-control-1 .item-inner'],
    },
  ],
};

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

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
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
