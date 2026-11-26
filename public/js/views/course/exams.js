/** Mục Ôn thi. */
import {exams, examTerms, getNode} from '../../core/catalog.js';
import {state, unlocked} from '../../core/store.js';
import {esc, link, outside, empty} from '../helpers.js';
import {ico} from '../icons.js';

export function examsTab(id) {
  const term = state.examTerm, set = exams[id]?.[term] || {}, papers = set.papers || [], practice = set.practice, quiz = practice?.questions || [];
  const label = examTerms.find(([key]) => key === term)[1].toLowerCase();
  const paperList = papers.length
    ? `<ul class="papers">${papers.map(p => `<li>${outside(p.url, 'paper', `<span class="paper-icon">${ico('file', 22)}</span><span><strong>${esc(p.title)}</strong><small>${esc(p.detail)}</small></span>${ico('external', 18)}`)}</li>`).join('')}</ul>${set.note ? `<p class="note">${esc(set.note)}</p>` : ''}`
    : empty('file', `Chưa có đề ${label} các năm trước`, quiz.length ? 'Bạn có thể luyện với đề tự luyện bên dưới.' : '');
  return `<section class="stack"><div class="segmented" role="group" aria-label="Chọn kỳ thi">${examTerms.map(([key, name]) =>
    `<button type="button" data-action="exam-term" data-term="${key}" aria-pressed="${key === term}">${name}</button>`).join('')}</div>
  <div><h2>Đề các năm trước</h2>${paperList}</div>
  ${quiz.length ? `<div><h2>${esc(practice.title)}</h2><p class="sub">${quiz.length} câu · ${esc(practice.time)} · Hustree biên soạn</p>
  <ol class="exam-list">${quiz.map((item, i) => {
    const key = `${id}:${term}:${i}`, open = state.openAnswers.has(key), node = getNode(item.node);
    const review = !node ? '' : unlocked(node.id) ? link(`node/${node.id}`, 'text-link', `Ôn lại: ${esc(node.title)}`) : `<span class="muted">Thuộc chủ đề: ${esc(node.title)}</span>`;
    return `<li class="exam-q"><p class="exam-text">${esc(item.q)}</p>${open ? `<div class="answer">${esc(item.a).replaceAll('\\r\\n', '<br>')}</div>` : ''}
    <div class="row"><button type="button" class="btn btn-soft" data-action="exam-answer" data-key="${key}" aria-expanded="${open}">${open ? 'Ẩn đáp án' : 'Xem đáp án'}</button>${review}</div></li>`;
  }).join('')}</ol></div>` : ''}</section>`;
}
