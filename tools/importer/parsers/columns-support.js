/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-support
 * Base block: columns
 * Source: https://www.commbank.com.au/
 * Selector: .helpv2-module
 * Generated: 2026-06-08
 *
 * Extracts a two-column support/help layout:
 * - Column 1: Support heading with icon + list of support links
 * - Column 2: Contact us card + Locate us card (each with icon, heading, description)
 *
 * The section-level heading ("We're here to help") is placed before the block
 * as default content so it renders as a section heading in AEM.
 *
 * Source structure:
 * - .helpv2-heading h2 — section heading (default content, placed before block)
 * - .support-section .support-links — support links column
 *   - .items-head h3 a — heading link with icon ("Support & FAQs")
 *   - .items-list .support-content ul li a — individual support links
 * - .contact-section — contact/locate column
 *   - .contact-wrapper .contact-content — "Contact us" with icon and description
 *   - .locate-wrapper .locate-content — "Locate us" with icon and description
 */
export default function parse(element, { document }) {
  // --- Extract section heading and place before block as default content ---
  const sectionHeading = element.querySelector('.helpv2-heading h2, :scope > div > h2');

  // --- Column 1: Support & FAQs links ---
  const supportSection = element.querySelector('.support-section, .support-links');

  const col1Content = [];

  // Extract the main "Support & FAQs" heading link with icon
  const supportHeadLink = supportSection
    ? supportSection.querySelector('.items-head h3 a')
    : element.querySelector('.items-head h3 a');

  if (supportHeadLink) {
    // Get the icon image
    const iconImg = supportHeadLink.querySelector('.icon img, img');
    if (iconImg) {
      const img = document.createElement('img');
      img.src = iconImg.getAttribute('src') || '';
      img.alt = iconImg.getAttribute('alt') || '';
      col1Content.push(img);
    }
    // Build an h3 with the linked heading text
    const h3 = document.createElement('h3');
    const link = document.createElement('a');
    link.href = supportHeadLink.getAttribute('href') || '';
    // Extract text - try multiple approaches for robustness
    const textSpan = supportHeadLink.querySelector('div > span:first-child, div span:not(.right-hc-icon):not(.icon)');
    if (textSpan && textSpan.textContent.trim()) {
      link.textContent = textSpan.textContent.trim();
    } else {
      // Fallback: get all text content, strip icon/arrow text
      const cloned = supportHeadLink.cloneNode(true);
      cloned.querySelectorAll('.icon, .right-hc-icon, img').forEach((el) => el.remove());
      link.textContent = cloned.textContent.trim().replace(/\s+/g, ' ');
    }
    h3.appendChild(link);
    col1Content.push(h3);
  }

  // Extract support links list
  const supportList = supportSection
    ? supportSection.querySelector('.items-list .support-content ul, .support-content ul')
    : element.querySelector('.support-content ul');

  if (supportList) {
    const ul = document.createElement('ul');
    const listItems = Array.from(supportList.querySelectorAll('li'));
    listItems.forEach((li) => {
      const anchor = li.querySelector('a');
      if (anchor) {
        const newLi = document.createElement('li');
        const newLink = document.createElement('a');
        newLink.href = anchor.getAttribute('href') || '';
        // Get link text without arrow icon
        const linkText = anchor.textContent.trim().replace(/\s+/g, ' ');
        newLink.textContent = linkText;
        newLi.appendChild(newLink);
        ul.appendChild(newLi);
      }
    });
    col1Content.push(ul);
  }

  // --- Column 2: Contact us + Locate us ---
  const contactSection = element.querySelector('.contact-section');
  const col2Content = [];

  // Extract "Contact us" card
  const contactContent = contactSection
    ? contactSection.querySelector('.contact-wrapper .contact-content, .contact-content')
    : element.querySelector('.contact-content');

  if (contactContent) {
    const contactLink = contactContent.querySelector('h3 a');
    if (contactLink) {
      const iconImg = contactLink.querySelector('.icon img, img');
      if (iconImg) {
        const img = document.createElement('img');
        img.src = iconImg.getAttribute('src') || '';
        img.alt = iconImg.getAttribute('alt') || '';
        col2Content.push(img);
      }
      const h3 = document.createElement('h3');
      const link = document.createElement('a');
      link.href = contactLink.getAttribute('href') || '';
      // Extract text robustly
      const textSpan = contactLink.querySelector('div > span:first-child, div span:not(.right-hc-icon):not(.icon)');
      if (textSpan && textSpan.textContent.trim()) {
        link.textContent = textSpan.textContent.trim();
      } else {
        const cloned = contactLink.cloneNode(true);
        cloned.querySelectorAll('.icon, .right-hc-icon, img').forEach((el) => el.remove());
        link.textContent = cloned.textContent.trim().replace(/\s+/g, ' ');
      }
      h3.appendChild(link);
      col2Content.push(h3);
    }
    const contactDesc = contactContent.querySelector('.links-title p, p');
    if (contactDesc) {
      const p = document.createElement('p');
      p.textContent = contactDesc.textContent.trim();
      col2Content.push(p);
    }
  }

  // Extract "Locate us" card
  const locateContent = contactSection
    ? contactSection.querySelector('.locate-wrapper .locate-content, .locate-content')
    : element.querySelector('.locate-content');

  if (locateContent) {
    const locateLink = locateContent.querySelector('h3 a');
    if (locateLink) {
      const iconImg = locateLink.querySelector('.icon img, img');
      if (iconImg) {
        const img = document.createElement('img');
        img.src = iconImg.getAttribute('src') || '';
        img.alt = iconImg.getAttribute('alt') || '';
        col2Content.push(img);
      }
      const h3 = document.createElement('h3');
      const link = document.createElement('a');
      link.href = locateLink.getAttribute('href') || '';
      // Extract text robustly
      const textSpan = locateLink.querySelector('div > span:first-child, div span:not(.right-hc-icon):not(.icon)');
      if (textSpan && textSpan.textContent.trim()) {
        link.textContent = textSpan.textContent.trim();
      } else {
        const cloned = locateLink.cloneNode(true);
        cloned.querySelectorAll('.icon, .right-hc-icon, img').forEach((el) => el.remove());
        link.textContent = cloned.textContent.trim().replace(/\s+/g, ' ');
      }
      h3.appendChild(link);
      col2Content.push(h3);
    }
    const locateDesc = locateContent.querySelector('.links-title p, p');
    if (locateDesc) {
      const p = document.createElement('p');
      p.textContent = locateDesc.textContent.trim();
      col2Content.push(p);
    }
  }

  // --- Build cells array: single row with two columns ---
  const cells = [
    [col1Content, col2Content],
  ];

  // Place section heading before the block as default content
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-support', cells });

  if (sectionHeading) {
    const wrapper = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading.textContent.trim();
    wrapper.appendChild(h2);
    wrapper.appendChild(block);
    element.replaceWith(wrapper);
  } else {
    element.replaceWith(block);
  }
}
