/** Hộp thoại: đặt câu hỏi, phản hồi, báo cáo. */
import {getCourse, getNode} from '../core/catalog.js';
import {state} from '../core/store.js';
import {courseOptions, esc, topicOptions} from './helpers.js';
import {ico} from './icons.js';

function askForm(m) {
  const node = getNode(m.nodeId), courseId = node?.courseId || (getCourse(m.courseId) ? m.courseId : '');
  const choice = node
    ? `<p class="sub">${esc(getCourse(node.courseId).name)} · ${esc(node.title)}</p><input type="hidden" name="nodeId" value="${esc(node.id)}">`
    : `<div class="field-pair"><div class="field"><label for="ask-course">Môn học</label><select name="courseId" id="ask-course" data-topics="ask-node">${courseOptions(courseId)}</select></div>
      <div class="field"><label for="ask-node">Chủ đề</label><select name="nodeId" id="ask-node" ${courseId ? '' : 'disabled'}>${topicOptions(courseId)}</select></div></div>`;
  return `<h2>Đặt câu hỏi ẩn danh</h2><form id="ask-form">${choice}
    <div class="field"><label for="ask-title">Bạn đang vướng điều gì?</label><input name="title" id="ask-title" maxlength="120" ></div>
    <div class="field"><label for="ask-body">Bạn đã thử gì?</label><textarea name="body" id="ask-body" maxlength="1500"></textarea></div>
    <p class="sub">Mọi người dùng Hustree đều xem được. Đừng ghi tên thật, email hoặc mã sinh viên.</p>
    <button class="btn btn-primary btn-block" type="submit">Gửi câu hỏi</button></form>`;
}

export function modal() {
  const m = state.modal;
  if (!m) return '';
  const inside = {
    ask: () => askForm(m),
    reply: () => `<h2>Viết phản hồi</h2><p class="sub">${esc(state.qa.questions.find(q => q.id === m.questionId)?.title || '')}</p><form id="reply-form"><div class="field"><label for="reply-body">Giải thích của bạn</label><textarea name="body" id="reply-body" minlength="8" maxlength="1600" required></textarea></div><button type="submit" class="btn btn-primary btn-block">Gửi phản hồi</button></form>`,
    report: () => `<h2>Báo cáo nội dung</h2><form id="report-form"><div class="field"><label for="report-reason">Vấn đề bạn thấy</label><textarea name="reason" id="report-reason" minlength="8" maxlength="300" required></textarea></div><button type="submit" class="btn btn-primary btn-block">Gửi báo cáo</button></form>`
  }[m.type]();
  const label = {ask: 'Đặt câu hỏi', reply: 'Viết phản hồi', report: 'Báo cáo nội dung'}[m.type];
  return `<div class="overlay" data-action="overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="${label}"><button type="button" class="icon-btn modal-close" data-action="close-modal" aria-label="Đóng">${ico('x', 20)}</button>${inside}</div></div>`;
}
