/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: CommBank section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Selectors sourced from page-templates.json and validated against captured DOM.
 *
 * Template sections (homepage):
 *   1. .container.hero-container (line 276)
 *   2. .homepage-six-pack (line 314)
 *   3. .video-module.video-right (line 590) - note: full class is "video-module standard-spacing bottom-divider video-right"
 *   4. .column-control#column-control-0 (line 641)
 *   5. .cta-module.title-on-left (line 744) - note: full class is "cta-module standard-spacing bottom-divider title-on-left"
 *   6. .cardsV2 (line 756)
 *   7. .helpv2-module (line 863, style: "dark") - note: full class is "helpv2-module standard-spacing bottom-divider"
 *   8. .column-control#column-control-1 (line 997, style: "dark")
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block after the section element when style is defined
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before each section except the first
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
