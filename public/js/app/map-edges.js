/** Các sợi nối trên bản đồ kiến thức. */
import {getNode, nodesOf} from '../content/courses.js';
import {state, mastered} from '../core/store.js';

/** Vẽ sợi nối giữa các Node trên màn hình rộng. Sợi liền = đã thông suốt Node phía trước. */
export function drawEdges() {
  const panel = document.getElementById('knowledge-map');
  const svg = panel?.querySelector('.map-edges');
  if (!svg) return;
  svg.replaceChildren();
  if (window.matchMedia?.('(max-width: 1023px)').matches) return;
  const box = panel.getBoundingClientRect();
  if (!box.width) return;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const rectOf = id => panel.querySelector(`[data-map-node="${id}"]`)?.getBoundingClientRect();
  for (const node of nodesOf(state.segments[1])) for (const dep of node.deps) {
    const a = rectOf(dep), b = rectOf(node.id);
    if (!a || !b) continue;
    let d;
    if (getNode(dep).stage === node.stage) {
      const x = a.left - box.left + 34;
      d = `M${x} ${a.bottom - box.top}V${b.top - box.top}`;
    } else {
      const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top, x2 = b.left - box.left, y2 = b.top + b.height / 2 - box.top;
      const bend = Math.max(18, (x2 - x1) * .5);
      d = `M${x1} ${y1}C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge' + (mastered(dep) ? ' is-done' : ''));
    path.dataset.from = dep;
    path.dataset.to = node.id;
    svg.append(path);
  }
}

/** Rê chuột hoặc focus vào một Node để làm nổi các sợi nối liên quan. */
export function highlight(id) {
  for (const path of document.querySelectorAll?.('.map-edges .edge') || []) {
    path.classList.toggle('is-hot', Boolean(id) && (path.dataset.from === id || path.dataset.to === id));
  }
}
