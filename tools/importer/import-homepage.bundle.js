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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-support.js
  function parse(element, { document }) {
    const bgImage = element.querySelector('.banner-image img, img[class*="banner"], img[class*="hero"]');
    const heading = element.querySelector(".banner-content h2, .banner-content h1:not(.sr-only), h2, h1:not(.sr-only)");
    const descriptionContainer = element.querySelector(".banner-content > div:not(.cta)");
    const descriptions = descriptionContainer ? Array.from(descriptionContainer.querySelectorAll("p")) : Array.from(element.querySelectorAll(".banner-content p:not(:has(a))"));
    const ctaLinks = Array.from(
      element.querySelectorAll('.cta a, .banner-content a.button_primary, .banner-content a.button, .banner-content a[class*="button"]')
    );
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) {
      const h1 = document.createElement("h1");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-support", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-nav.js
  function parse2(element, { document }) {
    const cardItems = element.querySelectorAll(":scope .six-pack-links");
    const cells = [];
    cardItems.forEach((card) => {
      const icon = card.querySelector(".items-head img");
      const headingLink = card.querySelector(".items-head h3 > a");
      const subLinks = Array.from(card.querySelectorAll(".items-list .hyperlink-list li a"));
      const ctaLink = card.querySelector(".mobile-cta a");
      const imageCell = [];
      if (icon) {
        imageCell.push(icon);
      }
      const contentCell = [];
      if (headingLink) {
        const heading = document.createElement("h3");
        const link = document.createElement("a");
        link.href = headingLink.href || headingLink.getAttribute("href");
        const labelSpan = headingLink.querySelector("div > span:first-child");
        link.textContent = labelSpan ? labelSpan.textContent.trim() : headingLink.textContent.trim();
        heading.appendChild(link);
        contentCell.push(heading);
      }
      if (subLinks.length > 0) {
        const ul = document.createElement("ul");
        subLinks.forEach((subLink) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = subLink.href || subLink.getAttribute("href");
          a.textContent = subLink.textContent.trim();
          li.appendChild(a);
          ul.appendChild(li);
        });
        contentCell.push(ul);
      }
      if (ctaLink) {
        const cta = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaLink.href || ctaLink.getAttribute("href");
        a.textContent = ctaLink.textContent.trim();
        cta.appendChild(a);
        contentCell.push(cta);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function parse3(element, { document }) {
    const contentWrapper = element.querySelector(".content-wrapper");
    const headings = contentWrapper ? Array.from(contentWrapper.querySelectorAll(":scope > h2")) : Array.from(element.querySelectorAll("h2"));
    const heading = headings.find((h) => h.textContent.trim().length > 0);
    const itemDiv = contentWrapper ? contentWrapper.querySelector(".item") : element.querySelector(".item");
    const descriptionParas = itemDiv ? Array.from(itemDiv.querySelectorAll(":scope > p")).filter(
      (p) => p.textContent.trim().length > 0 && p.textContent.trim() !== "\xA0"
    ) : [];
    const ctaLinks = [];
    const textParas = [];
    descriptionParas.forEach((p) => {
      const link = p.querySelector("a");
      if (link) {
        ctaLinks.push(p);
      } else {
        textParas.push(p);
      }
    });
    const textColumnContent = [];
    if (heading) textColumnContent.push(heading);
    textParas.forEach((p) => textColumnContent.push(p));
    ctaLinks.forEach((p) => textColumnContent.push(p));
    const videoWrapper = element.querySelector(".video-wrapper");
    const iframe = videoWrapper ? videoWrapper.querySelector(".video iframe, iframe") : element.querySelector("iframe");
    const videoColumnContent = [];
    if (iframe) {
      const src = iframe.getAttribute("src") || "";
      const embedMatch = src.match(/youtube\.com\/embed\/([^?&#]+)/);
      if (embedMatch) {
        const videoId = embedMatch[1];
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const videoLink = document.createElement("a");
        videoLink.href = youtubeUrl;
        videoLink.textContent = youtubeUrl;
        videoColumnContent.push(videoLink);
      } else {
        const videoLink = document.createElement("a");
        videoLink.href = src;
        videoLink.textContent = src;
        videoColumnContent.push(videoLink);
      }
    }
    const cells = [
      [textColumnContent, videoColumnContent]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document }) {
    const columns = element.querySelectorAll(':scope > [class*="col-"]');
    const cells = [];
    columns.forEach((col) => {
      const img = col.querySelector(".image-section img, .item img");
      const heading = col.querySelector('.item-inner h3, .item-inner h2, .item-inner [class*="title"]');
      const innerDiv = col.querySelector(".item-inner > div");
      const description = innerDiv ? innerDiv.querySelector("p") : col.querySelector(".item-inner p:not(:last-child)");
      const cta = col.querySelector('.item-inner > p > a, .item-inner a.button_tertiary, .item-inner a[class*="button"]');
      const imageCell = [];
      if (img) {
        imageCell.push(img);
      }
      const bodyCell = [];
      if (heading) bodyCell.push(heading);
      if (description) bodyCell.push(description);
      if (cta) {
        const ctaP = document.createElement("p");
        ctaP.append(cta);
        bodyCell.push(ctaP);
      }
      if (imageCell.length || bodyCell.length) {
        cells.push([imageCell, bodyCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse5(element, { document }) {
    const cells = [];
    const promoCards = element.querySelectorAll(".card-section .card.promotion");
    promoCards.forEach((promoCard) => {
      const image = promoCard.querySelector(".img-container img");
      const titleEl = promoCard.querySelector(".card-header h3 p, .card-header h3");
      const descEl = promoCard.querySelector(".card-content p");
      const ctaLink = promoCard.querySelector(".card-cta a");
      const contentCell = [];
      if (titleEl) {
        const heading = document.createElement("h3");
        heading.textContent = titleEl.textContent.trim();
        contentCell.push(heading);
      }
      if (descEl) {
        const desc = document.createElement("p");
        desc.textContent = descEl.textContent.trim();
        contentCell.push(desc);
      }
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.getAttribute("href");
        link.textContent = ctaLink.textContent.trim();
        contentCell.push(link);
      }
      if (image) {
        const imgEl = document.createElement("img");
        imgEl.src = image.getAttribute("src");
        imgEl.alt = (image.getAttribute("alt") || "").trim();
        cells.push([[imgEl], contentCell]);
      } else {
        cells.push([contentCell]);
      }
    });
    const miniCards = element.querySelectorAll(".card-section .card.mini");
    miniCards.forEach((miniCard) => {
      const link = miniCard.querySelector("a");
      const image = miniCard.querySelector(".img-container img");
      const titleEl = miniCard.querySelector(".card-header");
      const contentCell = [];
      if (titleEl && link) {
        const heading = document.createElement("h3");
        const anchor = document.createElement("a");
        anchor.href = link.getAttribute("href");
        anchor.textContent = titleEl.textContent.trim();
        heading.append(anchor);
        contentCell.push(heading);
      } else if (titleEl) {
        const heading = document.createElement("h3");
        heading.textContent = titleEl.textContent.trim();
        contentCell.push(heading);
      }
      if (image) {
        const imgEl = document.createElement("img");
        imgEl.src = image.getAttribute("src");
        imgEl.alt = (image.getAttribute("alt") || "").trim();
        cells.push([[imgEl], contentCell]);
      } else {
        cells.push([contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-support.js
  function parse6(element, { document }) {
    const sectionHeading = element.querySelector(".helpv2-heading h2, :scope > div > h2");
    const supportSection = element.querySelector(".support-section, .support-links");
    const col1Content = [];
    const supportHeadLink = supportSection ? supportSection.querySelector(".items-head h3 a") : element.querySelector(".items-head h3 a");
    if (supportHeadLink) {
      const iconImg = supportHeadLink.querySelector(".icon img, img");
      if (iconImg) {
        const img = document.createElement("img");
        img.src = iconImg.getAttribute("src") || "";
        img.alt = iconImg.getAttribute("alt") || "";
        col1Content.push(img);
      }
      const h3 = document.createElement("h3");
      const link = document.createElement("a");
      link.href = supportHeadLink.getAttribute("href") || "";
      const textSpan = supportHeadLink.querySelector("div > span:first-child, div span:not(.right-hc-icon):not(.icon)");
      if (textSpan && textSpan.textContent.trim()) {
        link.textContent = textSpan.textContent.trim();
      } else {
        const cloned = supportHeadLink.cloneNode(true);
        cloned.querySelectorAll(".icon, .right-hc-icon, img").forEach((el) => el.remove());
        link.textContent = cloned.textContent.trim().replace(/\s+/g, " ");
      }
      h3.appendChild(link);
      col1Content.push(h3);
    }
    const supportList = supportSection ? supportSection.querySelector(".items-list .support-content ul, .support-content ul") : element.querySelector(".support-content ul");
    if (supportList) {
      const ul = document.createElement("ul");
      const listItems = Array.from(supportList.querySelectorAll("li"));
      listItems.forEach((li) => {
        const anchor = li.querySelector("a");
        if (anchor) {
          const newLi = document.createElement("li");
          const newLink = document.createElement("a");
          newLink.href = anchor.getAttribute("href") || "";
          const linkText = anchor.textContent.trim().replace(/\s+/g, " ");
          newLink.textContent = linkText;
          newLi.appendChild(newLink);
          ul.appendChild(newLi);
        }
      });
      col1Content.push(ul);
    }
    const contactSection = element.querySelector(".contact-section");
    const col2Content = [];
    const contactContent = contactSection ? contactSection.querySelector(".contact-wrapper .contact-content, .contact-content") : element.querySelector(".contact-content");
    if (contactContent) {
      const contactLink = contactContent.querySelector("h3 a");
      if (contactLink) {
        const iconImg = contactLink.querySelector(".icon img, img");
        if (iconImg) {
          const img = document.createElement("img");
          img.src = iconImg.getAttribute("src") || "";
          img.alt = iconImg.getAttribute("alt") || "";
          col2Content.push(img);
        }
        const h3 = document.createElement("h3");
        const link = document.createElement("a");
        link.href = contactLink.getAttribute("href") || "";
        const textSpan = contactLink.querySelector("div > span:first-child, div span:not(.right-hc-icon):not(.icon)");
        if (textSpan && textSpan.textContent.trim()) {
          link.textContent = textSpan.textContent.trim();
        } else {
          const cloned = contactLink.cloneNode(true);
          cloned.querySelectorAll(".icon, .right-hc-icon, img").forEach((el) => el.remove());
          link.textContent = cloned.textContent.trim().replace(/\s+/g, " ");
        }
        h3.appendChild(link);
        col2Content.push(h3);
      }
      const contactDesc = contactContent.querySelector(".links-title p, p");
      if (contactDesc) {
        const p = document.createElement("p");
        p.textContent = contactDesc.textContent.trim();
        col2Content.push(p);
      }
    }
    const locateContent = contactSection ? contactSection.querySelector(".locate-wrapper .locate-content, .locate-content") : element.querySelector(".locate-content");
    if (locateContent) {
      const locateLink = locateContent.querySelector("h3 a");
      if (locateLink) {
        const iconImg = locateLink.querySelector(".icon img, img");
        if (iconImg) {
          const img = document.createElement("img");
          img.src = iconImg.getAttribute("src") || "";
          img.alt = iconImg.getAttribute("alt") || "";
          col2Content.push(img);
        }
        const h3 = document.createElement("h3");
        const link = document.createElement("a");
        link.href = locateLink.getAttribute("href") || "";
        const textSpan = locateLink.querySelector("div > span:first-child, div span:not(.right-hc-icon):not(.icon)");
        if (textSpan && textSpan.textContent.trim()) {
          link.textContent = textSpan.textContent.trim();
        } else {
          const cloned = locateLink.cloneNode(true);
          cloned.querySelectorAll(".icon, .right-hc-icon, img").forEach((el) => el.remove());
          link.textContent = cloned.textContent.trim().replace(/\s+/g, " ");
        }
        h3.appendChild(link);
        col2Content.push(h3);
      }
      const locateDesc = locateContent.querySelector(".links-title p, p");
      if (locateDesc) {
        const p = document.createElement("p");
        p.textContent = locateDesc.textContent.trim();
        col2Content.push(p);
      }
    }
    const cells = [
      [col1Content, col2Content]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-support", cells });
    if (sectionHeading) {
      const wrapper = document.createElement("div");
      const h2 = document.createElement("h2");
      h2.textContent = sectionHeading.textContent.trim();
      wrapper.appendChild(h2);
      wrapper.appendChild(block);
      element.replaceWith(wrapper);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/commbank-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".page-lockout",
        "#logonOverlay",
        "#logonDialog",
        "#hamDialog",
        "#dialog1"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".skip-links-module",
        "header",
        ".commbank-footer",
        ".cloudservice",
        "iframe",
        "#focus-announcer"
      ]);
      element.querySelectorAll("[data-track]").forEach((el) => {
        el.removeAttribute("data-track");
      });
      element.querySelectorAll("[onclick]").forEach((el) => {
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/commbank-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/commbank-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform3(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-support": parse,
    "cards-nav": parse2,
    "columns-video": parse3,
    "cards-article": parse4,
    "cards-promo": parse5,
    "columns-support": parse6
  };
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "CommBank main homepage with hero banner, product cards, and promotional content",
    urls: ["https://www.commbank.com.au/"],
    blocks: [
      {
        name: "hero-support",
        instances: [".hero-banner-module.homepage-banner"]
      },
      {
        name: "cards-nav",
        instances: [".six-packs-module .six-packs-wrapper"]
      },
      {
        name: "columns-video",
        instances: [".video-module.video-right"]
      },
      {
        name: "cards-article",
        instances: [".column-control#column-control-0 .four-column"]
      },
      {
        name: "cards-promo",
        instances: [".card-module-alt .card-combo"]
      },
      {
        name: "columns-support",
        instances: [".helpv2-module"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".container.hero-container",
        style: null,
        blocks: ["hero-support"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Product Navigation Grid",
        selector: ".homepage-six-pack",
        style: null,
        blocks: ["cards-nav"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Video Feature",
        selector: ".video-module.video-right",
        style: null,
        blocks: ["columns-video"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Article Cards",
        selector: ".column-control#column-control-0",
        style: null,
        blocks: ["cards-article"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Financial Difficulty CTA",
        selector: ".cta-module.title-on-left",
        style: null,
        blocks: [],
        defaultContent: [".cta-module.title-on-left h2", ".cta-module.title-on-left .cta-wrapper"]
      },
      {
        id: "section-6",
        name: "More from CommBank",
        selector: ".cardsV2",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "Help Section",
        selector: ".helpv2-module",
        style: "dark",
        blocks: ["columns-support"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Disclaimers",
        selector: ".column-control#column-control-1",
        style: "dark",
        blocks: [],
        defaultContent: [".column-control#column-control-1 .header-content h2", ".column-control#column-control-1 .item-inner"]
      }
    ]
  };
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
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
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
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
  return __toCommonJS(import_homepage_exports);
})();
