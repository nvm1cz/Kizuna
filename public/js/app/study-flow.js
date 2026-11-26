/** Luồng học: đánh dấu Node và giải thích vì sao Node bị khóa. */
import {getNode, nodesOf} from '../core/catalog.js';
import {followers, missingPrereqs} from '../core/learning-path.js';
import {local, unlocked} from '../core/store.js';
import {notify, render} from './render.js';
import {runtime} from './runtime.js';

export function setStatus(id, status) {
  if (!unlocked(id)) return;
  const before = new Set(nodesOf(getNode(id).courseId).filter(n => unlocked(n.id)).map(n => n.id));
  local.progress[id] = status;
  runtime.sync.nodeChanged(id);
  render();
  const opened = followers(id).filter(n => unlocked(n.id) && !before.has(n.id));
  const closed = [...before].filter(other => !unlocked(other));
  if (opened.length) notify(`Đã mở khóa: ${opened.map(n => n.title).join(' · ')}`);
  else if (closed.length) notify(`${closed.length} chủ đề phía sau tạm khóa.`);
}

export function explainLock(id) {
  const missing = missingPrereqs(id, local.progress);
  notify(`Hãy thông suốt trước: ${missing.map(n => n.title).join(' · ')}`);
  for (const n of missing) {
    const card = document.querySelector(`[data-map-node="${n.id}"]`);
    if (!card) continue;
    card.classList.add('is-needed');
    setTimeout(() => card.classList.remove('is-needed'), 1800);
  }
}
