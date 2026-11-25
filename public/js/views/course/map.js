/** Mục Bản đồ kiến thức. */
import {stages, nodesOf} from '../../content/courses.js';
import {missingPrereqs} from '../../core/learning-path.js';
import {local, STATUS, getStatus, unlocked} from '../../core/store.js';
import {esc, link} from '../helpers.js';
import {ico} from '../icons.js';

function mapCard(n) {
  const open = unlocked(n.id), status = getStatus(n.id);
  const kind = !open ? 'locked' : status || 'open';
  const missing = missingPrereqs(n.id, local.progress).map(m => m.title);
  const label = !open ? 'Chưa mở khóa' : STATUS[status] || 'Sẵn sàng học';
  const icon = {locked: 'lock', clear: 'check', stuck: 'help', explore: 'compass', open: 'arrow'}[kind];
  const body = `<span class="map-icon">${ico(icon, 18)}</span><span class="map-copy"><strong>${esc(n.title)}</strong><small>${open ? label : `Cần: ${esc(missing.join(' · '))}`}</small></span>`;
  const attrs = `data-map-node="${n.id}"`;
  return open
    ? link(`node/${n.id}`, `map-card status-${kind}`, body, `${attrs} aria-label="${esc(`${n.title}. ${label}`)}"`)
    : `<button type="button" class="map-card status-locked" ${attrs} data-action="locked" data-id="${n.id}" aria-label="${esc(`${n.title}. Chưa mở khóa, cần thông suốt ${missing.join(' · ')}`)}">${body}</button>`;
}

export function mapTab(id) {
  const groups = stages.map((name, stage) => ({name, list: nodesOf(id).filter(n => n.stage === stage)})).filter(g => g.list.length);
  return `<section class="map" id="knowledge-map" aria-label="Bản đồ kiến thức"><svg class="map-edges" aria-hidden="true"></svg>
    <div class="map-track">${groups.map((g, i) => `<section class="map-stage"><h2><span>${i + 1}</span>${esc(g.name)}</h2><div class="map-nodes">${g.list.map(mapCard).join('')}</div></section>`).join('')}</div></section>
  <p class="map-legend"><span class="key key-clear">Đã thông suốt</span><span class="key key-open">Sẵn sàng học</span><span class="key key-locked">Chưa mở khóa</span></p>`;
}
