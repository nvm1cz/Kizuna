/** Trang một Node (chủ đề). */
import {getCourse, getNode} from '../core/catalog.js';
import {missingPrereqs, nextStepTo, followers} from '../core/learning-path.js';
import {local, state, STATUS, getStatus, unlocked, mastered, hasEmpathy, empathyCount} from '../core/store.js';
import {documentLink, esc, link} from './helpers.js';
import {ico} from './icons.js';
import {offlineNote, questionCard} from './questions.js';

const resource = (r, main = false) => documentLink(r, `resource ${main ? 'is-main' : ''}`,
  `<span class="paper-icon">${ico(r.filePath ? 'file' : 'book', 22)}</span><span><strong>${esc(r.title)}</strong><small>${main ? 'Nên đọc trước' : 'Đọc thêm'}${r.by ? ` · ${esc(r.by)} đóng góp` : ''}</small></span>${ico('external', 18)}`);

function lockedPage(n, c) {
  const missing = missingPrereqs(n.id, local.progress), next = nextStepTo(n.id, local.progress);
  return `${link(`course/${c.id}`, 'back-link', `${ico('back', 18)} ${esc(c.name)}`)}
  <section class="locked-page"><span class="lock-mark">${ico('lock', 34)}</span><h1>${esc(n.title)}</h1><p>Chủ đề này mở khóa khi bạn thông suốt:</p>
  <ul>${missing.map(m => `<li>${ico(unlocked(m.id) ? 'compass' : 'lock', 18)} ${esc(m.title)}</li>`).join('')}</ul>
  ${link(`node/${next.id}`, 'btn btn-primary', `Học ${esc(next.title)}`)}</section>`;
}

function unlockPanel(n) {
  if (!mastered(n.id)) return '';
  const next = followers(n.id);
  if (!next.length) return `<div class="unlock"><strong>${ico('check', 20)} Bạn đã hoàn thành nhánh này.</strong>${link(`course/${n.courseId}`, 'btn btn-primary', 'Về bản đồ')}</div>`;
  return `<div class="unlock"><strong>${ico('unlock', 20)} Học tiếp</strong><div class="chips">${next.map(f => unlocked(f.id)
    ? link(`node/${f.id}`, 'chip', `${esc(f.title)} ${ico('arrow', 16)}`)
    : `<button type="button" class="chip is-locked" data-action="locked" data-id="${f.id}">${ico('lock', 16)} ${esc(f.title)}</button>`).join('')}</div></div>`;
}

const NODE_STEPS = ['Tóm tắt khái niệm', 'Tài liệu chọn lọc', 'Cảnh báo bẫy', 'Flash-check', 'Hỏi đáp', 'Tự đánh giá'];

export function nodePage(id) {
  const n = getNode(id), c = getCourse(n.courseId);
  if (!unlocked(id)) return lockedPage(n, c);
  const selected = getStatus(id), questions = state.qa.questions.filter(q => q.nodeId === id);
  const index = Math.max(0, Math.min(n.flash.length - 1, state.flashIndex[id] || 0)), flash = n.flash[index];
  const shown = local.answers[id]?.includes(index), voted = hasEmpathy('node', id);
  const [main, ...more] = n.resources;

  const bodies = [
    `<p class="summary">${esc(n.summary)}</p>`,
    `${main ? resource(main, true) : '<p class="muted">Chưa có tài liệu.</p>'}${more.map(r => resource(r)).join('')}<p class="contribute-hint">${link(`contribute/send/${id}`, 'text-link', `${ico('gift', 18)} Đóng góp tài liệu cho chủ đề này`)}</p>`,
    n.pitfall ? `<div class="pitfall">${ico('alert', 22)}<p>${esc(n.pitfall)}</p></div>` : '<p class="muted">Chưa có cảnh báo.</p>',
    !flash ? '<p class="muted">Chưa có câu hỏi.</p>' : `<div class="flash"><p class="flash-q">${esc(flash.q)}</p>${shown ? `<div class="answer">${esc(flash.a)}</div>` : ''}
      <div class="row"><button type="button" class="btn btn-soft" data-action="quiz-toggle" data-id="${id}" data-index="${index}" aria-expanded="${Boolean(shown)}">${shown ? 'Ẩn giải thích' : 'Xem giải thích'}</button>
      ${n.flash.length > 1 ? `<span class="pager"><button type="button" class="icon-btn" aria-label="Câu trước" data-action="flash-step" data-id="${id}" data-step="-1" ${index === 0 ? 'disabled' : ''}>${ico('back', 20)}</button>${index + 1}/${n.flash.length}<button type="button" class="icon-btn" aria-label="Câu sau" data-action="flash-step" data-id="${id}" data-step="1" ${index === n.flash.length - 1 ? 'disabled' : ''}>${ico('chevron', 20)}</button></span>` : ''}</div></div>`,
    `${state.qaError ? offlineNote() : ''}<div class="row"><button type="button" class="btn btn-primary" data-action="ask" data-node="${id}">${ico('plus', 18)} Đặt câu hỏi</button>
      <button type="button" class="btn btn-ghost ${voted ? 'is-voted' : ''}" data-action="empathy" data-type="node" data-id="${id}" ${voted ? 'disabled' : ''}>${ico('heart', 18)} Tôi cũng đang kẹt · ${empathyCount('node', id)}</button></div>
      ${questions.length ? `<div class="q-list">${(state.qaExpanded ? questions : questions.slice(0, 2)).map(q => questionCard(q)).join('')}</div>` : ''}
      ${questions.length > 2 ? `<button type="button" class="text-link" data-action="qa-show-more">${state.qaExpanded ? 'Thu gọn' : `Xem tất cả ${questions.length} câu hỏi`}</button>` : ''}`,
    `<div class="status-row" role="group" aria-label="Mức độ hiểu">${[['explore', 'compass'], ['stuck', 'help'], ['clear', 'check']].map(([value, icon]) =>
      `<button type="button" class="status-btn ${value}" data-action="set-status" data-id="${id}" data-status="${value}" aria-pressed="${selected === value}">${ico(icon, 20)} ${STATUS[value]}</button>`).join('')}</div>${unlockPanel(n)}`
  ];
  return `${link(`course/${c.id}`, 'back-link', `${ico('back', 18)} ${esc(c.name)}`)}
  <div class="node-layout"><aside class="toc" aria-label="Các mục"><ol>${NODE_STEPS.map((name, i) => `<li><button type="button" data-action="jump" data-target="step-${i + 1}">${name}</button></li>`).join('')}</ol></aside>
  <article class="node"><header class="node-head"><h1>${esc(n.title)}</h1></header>
  ${NODE_STEPS.map((name, i) => `<section class="node-step" id="step-${i + 1}"><h2><span>${i + 1}</span>${name}</h2>${bodies[i]}</section>`).join('')}</article></div>`;
}
