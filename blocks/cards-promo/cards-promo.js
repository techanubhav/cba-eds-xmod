import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  const rows = [...block.children];

  rows.forEach((row, index) => {
    const li = document.createElement('li');
    const cells = [...row.children];

    // First cell: image (may be a link to image or a picture element)
    const imageCell = cells[0];
    if (imageCell) {
      const div = document.createElement('div');
      div.className = 'cards-promo-card-image';

      const link = imageCell.querySelector('a');
      const picture = imageCell.querySelector('picture');

      if (picture) {
        div.append(picture);
      } else if (link) {
        // Image URL is in the href of the anchor
        const imgSrc = link.href;
        const pic = createOptimizedPicture(imgSrc, '', false, [{ width: '750' }]);
        div.append(pic);
      }
      li.append(div);
    }

    // Second cell: body content (title, description, CTA)
    const bodyCell = cells[1];
    if (bodyCell) {
      const div = document.createElement('div');
      div.className = 'cards-promo-card-body';
      while (bodyCell.firstElementChild) div.append(bodyCell.firstElementChild);
      li.append(div);
    }

    // Mark mini cards (rows 3-5, index 2+)
    if (index >= 2) {
      li.classList.add('cards-promo-mini');
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
