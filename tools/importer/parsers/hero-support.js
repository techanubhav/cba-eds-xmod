/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-support variant.
 * Base block: hero
 * Source: https://www.commbank.com.au/
 * Selector: .hero-banner-module.homepage-banner
 * Generated: 2026-06-08
 *
 * Source structure:
 *   div.hero-banner-module.homepage-banner
 *     div.banner-image > img (background image)
 *     div.banner-content-panel > div.banner-content
 *       h1.sr-only (screen-reader only heading)
 *       h2 (visible heading)
 *       div > p (description)
 *       div.cta > p > a.button_primary (CTA link)
 *
 * Target structure (hero block):
 *   Row 1: background image
 *   Row 2: heading + description + CTA links
 */
export default function parse(element, { document }) {
  // Extract background image
  const bgImage = element.querySelector('.banner-image img, img[class*="banner"], img[class*="hero"]');

  // Extract visible heading (h2 is the visible one; h1 is sr-only)
  const heading = element.querySelector('.banner-content h2, .banner-content h1:not(.sr-only), h2, h1:not(.sr-only)');

  // Extract description paragraph(s)
  const descriptionContainer = element.querySelector('.banner-content > div:not(.cta)');
  const descriptions = descriptionContainer
    ? Array.from(descriptionContainer.querySelectorAll('p'))
    : Array.from(element.querySelectorAll('.banner-content p:not(:has(a))'));

  // Extract CTA links
  const ctaLinks = Array.from(
    element.querySelectorAll('.cta a, .banner-content a.button_primary, .banner-content a.button, .banner-content a[class*="button"]')
  );

  // Build cells array matching hero block structure
  const cells = [];

  // Row 1: Background image
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content (heading + description + CTAs) in a single cell
  const contentCell = [];
  if (heading) {
    // Convert h2 to h1 for proper hero heading hierarchy
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.trim();
    contentCell.push(h1);
  }
  descriptions.forEach((desc) => {
    if (desc.textContent.trim()) {
      contentCell.push(desc);
    }
  });
  ctaLinks.forEach((link) => {
    contentCell.push(link);
  });

  if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-support', cells });
  element.replaceWith(block);
}
