/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-video
 * Base block: columns
 * Source: https://www.commbank.com.au/
 * Selector: .video-module.video-right
 * Generated: 2026-06-08
 *
 * Extracts a two-column layout with text content (heading, description, CTA)
 * on one side and a YouTube video embed on the other.
 *
 * Source structure:
 * - .content-wrapper contains heading (h2), description (p), and CTA link (a.button_tertiary)
 * - .video-wrapper contains a .video div with a YouTube iframe
 * - Content is duplicated between .content-wrapper and .video-wrapper for responsive display
 *   so we extract text from .content-wrapper and video from .video-wrapper
 */
export default function parse(element, { document }) {
  // --- Column 1: Text content from .content-wrapper ---
  const contentWrapper = element.querySelector('.content-wrapper');

  // Extract heading - skip empty h2 elements, get the one with text content
  const headings = contentWrapper
    ? Array.from(contentWrapper.querySelectorAll(':scope > h2'))
    : Array.from(element.querySelectorAll('h2'));
  const heading = headings.find((h) => h.textContent.trim().length > 0);

  // Extract description paragraphs from .item (skip empty ones and &nbsp;)
  const itemDiv = contentWrapper
    ? contentWrapper.querySelector('.item')
    : element.querySelector('.item');
  const descriptionParas = itemDiv
    ? Array.from(itemDiv.querySelectorAll(':scope > p')).filter(
        (p) => p.textContent.trim().length > 0 && p.textContent.trim() !== ' ',
      )
    : [];

  // Separate CTA links from description text
  const ctaLinks = [];
  const textParas = [];
  descriptionParas.forEach((p) => {
    const link = p.querySelector('a');
    if (link) {
      ctaLinks.push(p);
    } else {
      textParas.push(p);
    }
  });

  // Build text column content
  const textColumnContent = [];
  if (heading) textColumnContent.push(heading);
  textParas.forEach((p) => textColumnContent.push(p));
  ctaLinks.forEach((p) => textColumnContent.push(p));

  // --- Column 2: Video from .video-wrapper ---
  const videoWrapper = element.querySelector('.video-wrapper');
  const iframe = videoWrapper
    ? videoWrapper.querySelector('.video iframe, iframe')
    : element.querySelector('iframe');

  // Convert iframe src to a clickable YouTube link for AEM auto-embed
  const videoColumnContent = [];
  if (iframe) {
    const src = iframe.getAttribute('src') || '';
    // Extract video ID and build standard YouTube watch URL
    const embedMatch = src.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch) {
      const videoId = embedMatch[1];
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const videoLink = document.createElement('a');
      videoLink.href = youtubeUrl;
      videoLink.textContent = youtubeUrl;
      videoColumnContent.push(videoLink);
    } else {
      // Fallback: use iframe src as-is
      const videoLink = document.createElement('a');
      videoLink.href = src;
      videoLink.textContent = src;
      videoColumnContent.push(videoLink);
    }
  }

  // --- Build cells array: single row with two columns ---
  const cells = [
    [textColumnContent, videoColumnContent],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
