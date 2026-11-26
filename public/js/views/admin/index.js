/** Trang Quản trị: duyệt tài liệu, nội dung, báo cáo, thành viên. */
import {getMajor, getNode, courses, nodesOf} from '../../core/catalog.js';
import {state} from '../../core/store.js';
import {courseOptions, documentLink, empty, esc, formatDate, link, topicOptions} from '../helpers.js';
import {ico} from '../icons.js';
import {courseAdmin} from './course.js';
import {editorPage} from './editor.js';

const TABS = [['review', 'Duyệt tài liệu'], ['content', 'Nội dung'], ['reports', 'Báo cáo'], ['users', 'Thành viên']];
export const adminTab = () => TABS.some(([id]) => id === state.segments[1]) ? state.segments[1] : 'review';

function reviewTab() {
  const list = state.admin.pending;
  if (!list) return '<p class="note">Đang tải</p>';
  if (!list.length) return empty('check', 'Không có tài liệu chờ duyệt');
  return `<div class="stack">${list.map(c => {
    const node = getNode(c.nodeId), id = esc(c.id), rejecting = state.admin.rejecting === c.id;
    return `<form class="panel review" data-form="review" data-id="${id}"><header><div><h3>${esc(c.title)}</h3><p class="sub">${esc(c.by)} · ${formatDate(c.createdAt)}</p></div>${documentLink(c, 'btn btn-soft', `${ico(c.filePath ? 'file' : 'external', 18)} Xem tài liệu`)}</header>
    ${c.url ? `<p class="review-url">${esc(c.url)}</p>` : ''}${c.note ? `<blockquote>${esc(c.note)}</blockquote>` : ''}
    ${rejecting ? `<div class="field"><label for="rr-${id}">Lý do chưa duyệt</label><textarea id="rr-${id}" name="reason" required minlength="4" maxlength="300"></textarea></div>
      <div class="row"><button type="submit" name="decision" value="reject" class="btn btn-danger">Gửi lý do</button><button type="button" class="btn btn-ghost" data-action="cancel-reject">Quay lại</button></div>`
    : `<div class="field"><label for="rt-${id}">Tên khi đăng</label><input id="rt-${id}" name="title" required maxlength="160" value="${esc(c.title)}"></div>
      <div class="field-pair"><div class="field"><label for="rc-${id}">Môn học</label><select id="rc-${id}" data-topics="rn-${id}" required>${courseOptions(node?.courseId)}</select></div>
      <div class="field"><label for="rn-${id}">Đăng vào chủ đề</label><select id="rn-${id}" name="nodeId" required>${topicOptions(node?.courseId, node?.id)}</select></div></div>
      <div class="row"><button type="submit" name="decision" value="approve" class="btn btn-primary">${ico('check', 18)} Duyệt và đăng</button><button type="button" class="btn btn-ghost" data-action="start-reject" data-id="${id}">Chưa duyệt</button></div>`}</form>`;
  }).join('')}</div>`;
}

function contentTab() {
  if (state.segments[2]) return courseAdmin(state.segments[2]);
  return `<div class="section-head"><h2>${courses.length} môn học</h2><button type="button" class="btn btn-primary" data-action="edit" data-kind="course">${ico('plus', 18)} Thêm môn</button></div>
  ${courses.length ? `<ul class="rows">${courses.map(c => `<li>${link(`admin/content/${c.id}`, 'row-item', `<span class="course-icon small" style="--c:${esc(c.color)};--s:${esc(c.soft)}">${ico(c.icon, 22)}</span><div><strong>${esc(c.name)}</strong><p class="sub">${esc(c.code)} · ${nodesOf(c.id).length} Node · ${c.majors.length} ngành</p></div>${c.published ? '' : '<span class="tag tag-sample">Đang ẩn</span>'}${ico('chevron', 18)}`)}</li>`).join('')}</ul>` : empty('book', 'Chưa có môn học nào')}`;
}

function reportsTab() {
  const list = state.admin.reports;
  if (!list) return '<p class="note">Đang tải</p>';
  if (!list.length) return empty('flag', 'Chưa có báo cáo nào');
  return `<ul class="rows">${list.map(r => `<li class="row-item"><div><strong>${esc(r.title || r.body || 'Câu hỏi chưa có tiêu đề')}</strong><p class="reason">${esc(r.reason)}</p><p class="sub">${formatDate(r.createdAt)}</p></div>
    ${r.hidden ? '<span class="tag">Đã ẩn</span>' : `${link(`community/${r.questionId}`, 'text-link', 'Xem')}<button type="button" class="btn btn-ghost" data-action="hide" data-kind="question" data-id="${esc(r.questionId)}">Ẩn câu hỏi</button>`}</li>`).join('')}</ul>`;
}

function usersTab() {
  const list = state.admin.users;
  if (!list) return '<p class="note">Đang tải</p>';
  return `<ul class="rows">${list.map(u => `<li class="row-item"><div><strong>${esc(u.name || 'Chưa đặt tên')}${u.me ? ' (bạn)' : ''}</strong><p class="sub">${esc(u.email)}${u.majorId ? ` · ${esc(u.majorId)} ${esc(getMajor(u.majorId)?.name)} · Năm ${esc(u.year)}` : ''}</p></div>
    <span class="tag ${u.role === 'admin' ? '' : 'tag-public'}">${u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
    ${u.me ? '' : `<button type="button" class="btn btn-ghost" data-action="set-role" data-id="${esc(u.id)}" data-role="${u.role === 'admin' ? 'user' : 'admin'}">${u.role === 'admin' ? 'Gỡ quyền quản trị' : 'Cấp quyền quản trị'}</button>`}</li>`).join('')}</ul>`;
}

export function adminPage() {
  if (state.admin.draft) return editorPage();
  const tab = adminTab(), waiting = state.admin.pending?.length;
  return `<h1>Quản trị</h1><nav class="tabs" aria-label="Mục quản trị">${TABS.map(([id, name]) =>
    link(`admin/${id}`, 'tab', `${name}${id === 'review' && waiting ? ` (${waiting})` : ''}`, id === tab ? 'aria-current="page"' : '')).join('')}</nav>${{review: reviewTab, content: contentTab, reports: reportsTab, users: usersTab}[tab]()}`;
}
