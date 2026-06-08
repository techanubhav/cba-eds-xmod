/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-nav
 * Base block: cards
 * Source selector: .six-packs-module .six-packs-wrapper
 * Description: Navigation cards grid with icon, category heading, sub-links, and CTA per card.
 * Generated: 2026-06-08
 */
export default function parse(element, { document }) {
  // Each .six-pack-links div is a navigation card
  const cardItems = element.querySelectorAll(':scope .six-pack-links');

  const cells = [];

  cardItems.forEach((card) => {
    // Extract icon image from the desktop header (.items-head)
    const icon = card.querySelector('.items-head img');

    // Extract the category heading link from desktop view
    const headingLink = card.querySelector('.items-head h3 > a');

    // Extract sub-navigation links from .hyperlink-list
    const subLinks = Array.from(card.querySelectorAll('.items-list .hyperlink-list li a'));

    // Extract the "More from..." CTA link
    const ctaLink = card.querySelector('.mobile-cta a');

    // Build image cell
    const imageCell = [];
    if (icon) {
      imageCell.push(icon);
    }

    // Build content cell: heading + sub-links + CTA
    const contentCell = [];

    // Create heading with link
    if (headingLink) {
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = headingLink.href || headingLink.getAttribute('href');
      // Extract text from the span inside the heading link (not the arrow icon)
      const labelSpan = headingLink.querySelector('div > span:first-child');
      link.textContent = labelSpan ? labelSpan.textContent.trim() : headingLink.textContent.trim();
      heading.appendChild(link);
      contentCell.push(heading);
    }

    // Add sub-navigation links as a list
    if (subLinks.length > 0) {
      const ul = document.createElement('ul');
      subLinks.forEach((subLink) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = subLink.href || subLink.getAttribute('href');
        a.textContent = subLink.textContent.trim();
        li.appendChild(a);
        ul.appendChild(li);
      });
      contentCell.push(ul);
    }

    // Add CTA link
    if (ctaLink) {
      const cta = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.href || ctaLink.getAttribute('href');
      a.textContent = ctaLink.textContent.trim();
      cta.appendChild(a);
      contentCell.push(cta);
    }

    // Each card is a row with [image, content]
    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nav', cells });
  element.replaceWith(block);
}
