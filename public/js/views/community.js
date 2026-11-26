/** Trang Hỏi đáp. */
import {courses, getCourse, getNode} from '../core/catalog.js';
import {state} from '../core/store.js';
import {esc, empty} from './helpers.js';
import {ico} from './icons.js';
import {offlineNote, questionCard} from './questions.js';

export function communityPage() {
  const q = state.communitySearch.toLowerCase().trim();
  const list = state.qa.questions.filter(x => (state.communityFilter === 'all' || (getNode(x.nodeId)?.courseId || x.courseId) === state.communityFilter)
    && [x.title, x.body, getNode(x.nodeId)?.title, getCourse(x.courseId)?.name].join(' ').toLowerCase().includes(q));
  return `<div class="narrow"><div class="section-head"><h1>Hỏi đáp</h1><button type="button" class="btn btn-primary" data-action="ask">${ico('plus', 18)} Đặt câu hỏi mới</button></div>
  ${state.qaError ? offlineNote() : ''}
  <label class="searchbox wide">${ico('search', 20)}<input id="qa-search" type="search" placeholder="Tìm câu hỏi" value="${esc(state.communitySearch)}" aria-label="Tìm câu hỏi"></label>
  <div class="pills" role="group" aria-label="Lọc theo môn">${[['all', 'Tất cả'], ...courses.map(c => [c.id, c.name])].map(([id, name]) =>
    `<button type="button" class="pill" aria-pressed="${state.communityFilter === id}" data-action="qa-filter" data-value="${id}">${esc(name)}</button>`).join('')}</div>
  ${list.length ? `<div class="q-list">${list.map(x => questionCard(x, true)).join('')}</div>` : empty('message', 'Chưa có câu hỏi phù hợp')}</div>`;
}
