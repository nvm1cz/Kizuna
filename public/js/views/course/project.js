/** Mục Bài tập lớn. */
import {getNode, guides} from '../../core/catalog.js';
import {local, unlocked} from '../../core/store.js';
import {empty, esc, link, outside} from '../helpers.js';
import {ico} from '../icons.js';

export function projectTab(id) {
  const g = guides[id];
  if (!g?.scenario) return empty('book', 'Chưa có bài tập lớn');
  const {project = [], deliverables = [], reference} = g;
  return `<section class="stack"><div class="lead"><h2>${esc(g.scenario)}</h2><p>${esc(g.outcome)}</p><span class="tag">Đề bài mẫu</span></div>
  <ol class="steps">${project.map(s => {
    const n = getNode(s.node), open = n && unlocked(s.node);
    const target = !n ? '' : open ? link(`node/${n.id}`, 'chip', `${ico('book', 16)} ${esc(n.title)}`)
      : `<button type="button" class="chip is-locked" data-action="locked" data-id="${n.id}">${ico('lock', 16)} ${esc(n.title)}</button>`;
    return `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.detail)}</p>${s.output ? `<p class="step-out">${ico('check', 18)}<span>${esc(s.output)}</span></p>` : ''}${target}</li>`;
  }).join('')}</ol>
  ${deliverables.length ? `<div class="panel"><h3>Trước khi nộp</h3><ul class="checks">${deliverables.map((item, i) => {
    const key = `${id}:${i}:${item.slice(0, 12)}`;
    return `<li><label><input type="checkbox" data-guide-check="${esc(key)}" ${local.guideChecks[key] ? 'checked' : ''}><span>${esc(item)}</span></label></li>`;
  }).join('')}</ul></div>` : ''}
  ${reference?.links?.length ? `<div class="panel"><h3>${esc(reference.title)}</h3><p>${esc(reference.description)}</p><div class="chips">${reference.links.map(l => outside(l.url, 'chip', `${esc(l.title)} ${ico('external', 15)}`)).join('')}</div></div>` : ''}</section>`;
}
