/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-article
 * Base block: cards
 * Source: https://www.commbank.com.au/
 * Selector: .column-control#column-control-0 .four-column
 * Generated: 2026-06-08
 *
 * Extracts article cards from the CommBank homepage four-column layout.
 * Each card has: image, heading (h3), description paragraph, and CTA link.
 * Output: one row per card with [image] | [heading, description, link].
 */
export default function parse(element, { document }) {
  // Each card is in a .col-sm-12.col-md-6.col-lg column within the .four-column row
  const columns = element.querySelectorAll(':scope > [class*="col-"]');

  const cells = [];

  columns.forEach((col) => {
    // Extract the image from .image-section
    const img = col.querySelector('.image-section img, .item img');

    // Extract heading from .item-inner
    const heading = col.querySelector('.item-inner h3, .item-inner h2, .item-inner [class*="title"]');

    // Extract description paragraph (first p inside the inner div, not the CTA paragraph)
    const innerDiv = col.querySelector('.item-inner > div');
    const description = innerDiv
      ? innerDiv.querySelector('p')
      : col.querySelector('.item-inner p:not(:last-child)');

    // Extract CTA link
    const cta = col.querySelector('.item-inner > p > a, .item-inner a.button_tertiary, .item-inner a[class*="button"]');

    // Build image cell
    const imageCell = [];
    if (img) {
      imageCell.push(img);
    }

    // Build body cell with heading, description, and CTA
    const bodyCell = [];
    if (heading) bodyCell.push(heading);
    if (description) bodyCell.push(description);
    if (cta) {
      // Wrap CTA in a paragraph to preserve link semantics
      const ctaP = document.createElement('p');
      ctaP.append(cta);
      bodyCell.push(ctaP);
    }

    // Only add the row if we have meaningful content
    if (imageCell.length || bodyCell.length) {
      cells.push([imageCell, bodyCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
