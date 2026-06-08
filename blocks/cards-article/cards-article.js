import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else if (div.children.length === 1 && div.querySelector('a[href]') && !div.querySelector('a').textContent.trim()) {
        // Bare link to an image URL (no text content) - convert to image
        const link = div.querySelector('a[href]');
        const href = link.getAttribute('href');
        if (href && (href.includes('/is/image/') || href.match(/\.(jpg|jpeg|png|webp|gif)/i))) {
          const pic = createOptimizedPicture(href, '', false, [{ width: '750' }]);
          div.textContent = '';
          div.append(pic);
        }
        div.className = 'cards-article-card-image';
      } else {
        div.className = 'cards-article-card-body';
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
