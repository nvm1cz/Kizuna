/** Hàm dựng HTML nhỏ dùng chung. Mọi chữ do người dùng nhập phải đi qua esc(). */
import {courses, nodesOf, majorsOf, schools} from '../core/catalog.js';
import {ico} from './icons.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));

/** Chỉ cho phép liên kết web; chặn javascript:, data:... */
export const safeUrl = url => /^https?:\/\//i.test(String(url ?? '')) ? url : '#';

export const link = (path, cls, body, extra = '') => `<a class="${cls}" href="#/${esc(path)}" ${extra}>${body}</a>`;
export const outside = (url, cls, body) => `<a class="${cls}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${body}</a>`;

/** Tài liệu là liên kết, hoặc tệp riêng tư phải xin đường dẫn tạm khi bấm. */
export const documentLink = (r, cls, body) => r.filePath
  ? `<button type="button" class="${cls}" data-action="open-file" data-path="${esc(r.filePath)}">${body}</button>`
  : outside(r.url, cls, body);

export const formatDate = s => {
  const time = Date.parse(s);
  return Number.isFinite(time) ? new Intl.DateTimeFormat('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(time) : '';
};
export function timeAgo(s) {
  const minutes = Math.floor((Date.now() - Date.parse(s)) / 60000);
  if (!(minutes >= 1)) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
  return minutes < 10080 ? `${Math.floor(minutes / 1440)} ngày trước` : formatDate(s);
}

export const empty = (icon, title, text = '', action = '') =>
  `<div class="empty">${ico(icon, 30)}<strong>${title}</strong>${text ? `<p>${text}</p>` : ''}${action}</div>`;

/* Lựa chọn cho thẻ select */
const option = (value, label, selected) => `<option value="${esc(value)}" ${String(value) === String(selected ?? '') ? 'selected' : ''}>${esc(label)}</option>`;
export const options = (pairs, selected, placeholder = null) =>
  (placeholder === null ? '' : `<option value="">${placeholder}</option>`) + pairs.map(([value, label]) => option(value, label, selected)).join('');
export const courseOptions = selected => options(courses.map(c => [c.id, `${c.code} · ${c.name}`]), selected, 'Chọn môn học');
export const topicOptions = (courseId, selected) => options(nodesOf(courseId).map(n => [n.id, n.title]), selected, 'Chọn chủ đề');
export const schoolOptions = selected => options(schools.map(s => [s.id, s.name]), selected, 'Chọn trường, khoa');
export const majorOptions = (schoolId, selected) => options(majorsOf(schoolId).map(m => [m.id, `${m.id} · ${m.name}`]), selected, 'Chọn ngành');
export const YEARS = [1, 2, 3, 4, 5, 6].map(y => [y, `Năm ${y}`]);
