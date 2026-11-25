/** Thẻ câu hỏi, dùng ở trang Node và trang Hỏi đáp. */
import {getCourse, getNode} from '../content/courses.js';
import {state, unlocked, hasEmpathy} from '../core/store.js';
import {esc, link, formatDate} from './helpers.js';
import {ico} from './icons.js';

export const offlineNote = () => `<p class="note note-warn">Chưa kết nối được kho hỏi đáp. <button type="button" class="text-link" data-action="retry">Thử lại</button></p>`;

export function questionCard(q, showNode = false) {
  const node = getNode(q.nodeId), open = state.expanded.has(q.id), voted = hasEmpathy('question', q.id);
  const replies = state.qa.replies.filter(r => r.questionId === q.id);
  const topic = node ? (unlocked(node.id) ? link(`node/${node.id}`, 'q-topic', esc(node.title)) : `<span class="q-topic">${esc(node.title)}</span>`) : esc(getCourse(q.courseId)?.name || '');
  return `<article class="question"><p class="q-meta">${esc(q.alias)} · ${formatDate(q.createdAt)}${q.demo ? ' · Minh họa' : ''}</p>
  <h3>${esc(q.title || 'Câu hỏi chưa có tiêu đề')}</h3>${q.body ? `<p>${esc(q.body)}</p>` : ''}${showNode && topic ? `<p class="q-topic-row">${topic}</p>` : ''}
  <div class="row"><button type="button" class="btn-mini ${voted ? 'is-voted' : ''}" ${voted ? 'disabled' : ''} data-action="empathy" data-type="question" data-id="${q.id}">${ico('heart', 17)} Tôi cũng đang kẹt · ${q.empathyCount || 0}</button>
  <button type="button" class="btn-mini" data-action="toggle-answers" data-id="${q.id}" aria-expanded="${open}">${ico('message', 17)} ${replies.length} phản hồi</button>
  <button type="button" class="btn-mini q-report" aria-label="Báo cáo nội dung" title="Báo cáo nội dung" data-action="report" data-id="${q.id}">${ico('flag', 17)}</button></div>
  ${open ? `<div class="replies">${replies.map(r => `<div class="reply"><p class="q-meta">${esc(r.alias)} · ${formatDate(r.createdAt)}</p><p>${esc(r.body)}</p></div>`).join('')}<button type="button" class="btn btn-soft" data-action="reply" data-id="${q.id}">Viết phản hồi</button></div>` : ''}</article>`;
}
