/** Hàm dựng HTML nhỏ dùng chung. Mọi chữ do người dùng nhập phải đi qua esc(). */
import {ico} from './icons.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));

export const link = (path, cls, body, extra = '') => `<a class="${cls}" href="#/${path}" ${extra}>${body}</a>`;
export const outside = (url, cls, body) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${body}</a>`;
export const formatDate = s => {
  const time = Date.parse(s);
  return Number.isFinite(time) ? new Intl.DateTimeFormat('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(time) : '';
};
export const empty = (icon, title, text = '', action = '') =>
  `<div class="empty">${ico(icon, 30)}<strong>${title}</strong>${text ? `<p>${text}</p>` : ''}${action}</div>`;
