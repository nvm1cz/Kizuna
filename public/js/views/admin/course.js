/** Quản trị một môn: thông tin chung, Node, giảng viên, bài tập lớn, đề thi. */
import {exams, examTerms, getCourse, guides, lecturers, nodesOf, stages} from '../../core/catalog.js';
import {empty, esc, link} from '../helpers.js';
import {ico} from '../icons.js';

const editBtn = (kind, key, label = 'Sửa') => `<button type="button" class="btn btn-ghost" data-action="edit" data-kind="${kind}" data-key="${esc(key)}">${label}</button>`;
const deleteBtn = (kind, id, name) => `<button type="button" class="icon-btn danger" aria-label="Xóa ${esc(name)}" title="Xóa" data-action="delete" data-kind="${kind}" data-id="${esc(id)}" data-name="${esc(name)}">${ico('trash', 20)}</button>`;

export function courseAdmin(id) {
  const c = getCourse(id);
  if (!c) return empty('book', 'Không tìm thấy môn này', '', link('admin/content', 'btn btn-primary', 'Về danh sách môn'));
  const nodes = nodesOf(id), teachers = lecturers[id] || [];
  return `${link('admin/content', 'back-link', `${ico('back', 18)} Tất cả môn`)}
  <div class="stack"><section class="panel"><div class="section-head"><div><h2>${esc(c.name)}</h2><p class="sub">${esc(c.code)} · ${c.majors.length} ngành${c.published ? '' : ' · Đang ẩn'}</p></div><div class="row">${link(`course/${id}`, 'btn btn-soft', 'Xem trang môn')}${editBtn('course', id)}${deleteBtn('course', id, c.name)}</div></div>
    <p class="chips">${c.majors.map(m => `<span class="chip is-locked">${esc(m.major)} · Năm ${esc(m.year)}</span>`).join('') || '<span class="muted">Chưa gắn với ngành nào</span>'}</p></section>
  <section><div class="section-head"><h2>Node</h2><button type="button" class="btn btn-primary" data-action="edit" data-kind="node">${ico('plus', 18)} Thêm Node</button></div>
    ${nodes.length ? `<ul class="rows">${nodes.map(n => `<li class="row-item"><div><strong>${esc(n.title)}</strong><p class="sub">${esc(stages[n.stage])} · ${n.resources.length} tài liệu</p></div>${editBtn('node', n.id)}${deleteBtn('node', n.id, n.title)}</li>`).join('')}</ul>` : empty('compass', 'Môn này chưa có Node')}</section>
  <section><div class="section-head"><h2>Giảng viên</h2><button type="button" class="btn btn-primary" data-action="edit" data-kind="lecturer">${ico('plus', 18)} Thêm giảng viên</button></div>
    ${teachers.length ? `<ul class="rows">${teachers.map(l => `<li class="row-item"><div><strong>${esc(l.name)}</strong><p class="sub">${esc(l.role)}${l.kind === 'sample' ? ' · Dữ liệu mẫu' : ''}</p></div>${editBtn('lecturer', l.id)}${deleteBtn('lecturer', l.id, l.name)}</li>`).join('')}</ul>` : empty('user', 'Chưa có giảng viên')}</section>
  <section><h2>Bài tập lớn và ôn thi</h2><ul class="rows"><li class="row-item"><div><strong>Bài tập lớn</strong><p class="sub">${esc(guides[id]?.scenario || 'Chưa có nội dung')}</p></div>${editBtn('guide', id)}</li>
    ${examTerms.map(([term, name]) => { const e = exams[id]?.[term]; return `<li class="row-item"><div><strong>Ôn thi ${name.toLowerCase()}</strong><p class="sub">${e?.papers?.length || 0} đề · ${e?.practice?.questions?.length || 0} câu tự luyện</p></div>${editBtn('exam', term)}</li>`; }).join('')}</ul></section></div>`;
}
