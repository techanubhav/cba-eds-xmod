/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo variant.
 * Base block: cards
 * Source: https://www.commbank.com.au/
 * Selector: .card-module-alt .card-combo
 * Generated: 2026-06-08
 *
 * Extracts promotional and mini card items from CommBank homepage
 * "More from CommBank" section. Handles two card types:
 * - Promotion cards (.card.promotion): image + h3 title + description + CTA link
 * - Mini cards (.card.mini): image + title (entire card wrapped in link)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract promotion cards from .carditem containers
  const promoCards = element.querySelectorAll('.card-section .card.promotion');

  promoCards.forEach((promoCard) => {
    const image = promoCard.querySelector('.img-container img');
    const titleEl = promoCard.querySelector('.card-header h3 p, .card-header h3');
    const descEl = promoCard.querySelector('.card-content p');
    const ctaLink = promoCard.querySelector('.card-cta a');

    const contentCell = [];

    // Build title as heading
    if (titleEl) {
      const heading = document.createElement('h3');
      heading.textContent = titleEl.textContent.trim();
      contentCell.push(heading);
    }

    // Add description
    if (descEl) {
      const desc = document.createElement('p');
      desc.textContent = descEl.textContent.trim();
      contentCell.push(desc);
    }

    // Add CTA link
    if (ctaLink) {
      const link = document.createElement('a');
      link.href = ctaLink.getAttribute('href');
      link.textContent = ctaLink.textContent.trim();
      contentCell.push(link);
    }

    // Row: [image cell, content cell]
    if (image) {
      const imgEl = document.createElement('img');
      imgEl.src = image.getAttribute('src');
      imgEl.alt = (image.getAttribute('alt') || '').trim();
      cells.push([[imgEl], contentCell]);
    } else {
      cells.push([contentCell]);
    }
  });

  // Extract mini cards - can be inside .carditem or directly in .card-section
  const miniCards = element.querySelectorAll('.card-section .card.mini');

  miniCards.forEach((miniCard) => {
    const link = miniCard.querySelector('a');
    const image = miniCard.querySelector('.img-container img');
    const titleEl = miniCard.querySelector('.card-header');

    const contentCell = [];

    // Build title as heading with link
    if (titleEl && link) {
      const heading = document.createElement('h3');
      const anchor = document.createElement('a');
      anchor.href = link.getAttribute('href');
      anchor.textContent = titleEl.textContent.trim();
      heading.append(anchor);
      contentCell.push(heading);
    } else if (titleEl) {
      const heading = document.createElement('h3');
      heading.textContent = titleEl.textContent.trim();
      contentCell.push(heading);
    }

    // Row: [image cell, content cell]
    if (image) {
      const imgEl = document.createElement('img');
      imgEl.src = image.getAttribute('src');
      imgEl.alt = (image.getAttribute('alt') || '').trim();
      cells.push([[imgEl], contentCell]);
    } else {
      cells.push([contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
