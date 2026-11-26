/** Mục Giảng viên. */
import {lecturers} from '../../core/catalog.js';
import {empty, esc, outside} from '../helpers.js';
import {ico} from '../icons.js';

const initials = name => name.split(' ').slice(-1)[0].slice(0, 1).toUpperCase();

function gradeBar(parts) {
  if (!parts?.length) return '';
  return `<div class="grade-bar" aria-hidden="true">${parts.map((g, i) => `<i class="g${i}" style="flex:${Number(g.weight) || 0}"></i>`).join('')}</div>
  <ul class="grade-key">${parts.map((g, i) => `<li><i class="g${i}"></i>${esc(g.label)} <strong>${Number(g.weight) || 0}%</strong></li>`).join('')}</ul>`;
}

function lecturerCard(l) {
  const facts = [['Tính cách', l.style], ['Điểm danh', l.attendance], ['Bài tập', l.homework], ['Lưu ý', l.rules]];
  const badge = l.kind === 'sample' ? '<span class="tag tag-sample">Dữ liệu mẫu</span>' : l.asOf ? `<span class="tag tag-public">${esc(l.asOf)}</span>` : '';
  return `<article class="lecturer"><header><span class="avatar" aria-hidden="true">${esc(initials(l.name))}</span><div><h3>${esc(l.name)}</h3><p>${esc(l.role)}</p></div>${badge}</header>
  <section class="grading"><h4>Cách chấm điểm</h4>${gradeBar(l.grading)}<p>${esc(l.gradingNote)}</p></section>
  <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd class="${v ? '' : 'unknown'}">${v ? esc(v) : 'Chưa có thông tin'}</dd></div>`).join('')}</dl>
  ${l.sources?.length ? `<footer>${l.sources.map(s => outside(s.url, 'text-link', `${esc(s.title)} ${ico('external', 15)}`)).join('')}</footer>` : ''}</article>`;
}

export const lecturersTab = id => !lecturers[id]?.length ? empty('user', 'Chưa có thông tin giảng viên')
  : `<section class="stack"><p class="note">Cách chấm có thể đổi theo học kỳ. Hãy đối chiếu với đề cương lớp bạn.</p>
  <div class="lecturer-grid">${lecturers[id].map(lecturerCard).join('')}</div></section>`;
