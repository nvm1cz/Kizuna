/** Trang chọn môn học: môn của năm, của ngành, hoặc tất cả. */
import {courses, coursesFor, getMajor} from '../core/catalog.js';
import {state} from '../core/store.js';
import {heroArt} from './brand.js';
import {esc, link, empty} from './helpers.js';
import {ico} from './icons.js';
import {progressOf, progressBar} from './progress.js';

function courseCard(c) {
  const p = progressOf(c.id);
  return link(`course/${c.id}`, 'course-card', `
    <span class="course-icon" style="--c:${esc(c.color)};--s:${esc(c.soft)}">${ico(c.icon, 28)}</span>
    <span class="course-code">${esc(c.code)}${c.published ? '' : ' · Đang ẩn'}</span>
    <strong class="course-name">${esc(c.name)}</strong>
    <span class="course-foot">${progressBar(p)}<span>${p.done}/${p.total} chủ đề</span></span>`);
}

export function homePage() {
  const {majorId, studyYear} = state.me || {}, q = state.search.toLowerCase().trim();
  const scopes = [['year', `Năm ${studyYear}`, () => coursesFor(majorId, studyYear)], ['major', majorId, () => coursesFor(majorId)], ['all', 'Tất cả', () => courses]];
  const scope = q ? 'all' : state.courseScope, pool = scopes.find(([id]) => id === scope)[2]();
  const list = pool.filter(c => `${c.name} ${c.code} ${c.short}`.toLowerCase().includes(q));
  const none = q ? empty('search', 'Không tìm thấy môn phù hợp', '', '<button type="button" class="btn btn-ghost" data-action="reset-courses">Xóa tìm kiếm</button>')
    : empty('book', scope === 'all' ? 'Chưa có môn học nào' : 'Chưa có môn cho lựa chọn này', scope === 'all' ? '' : 'Các môn đang được bổ sung dần.',
      scope === 'all' ? '' : '<button type="button" class="btn btn-ghost" data-action="course-scope" data-scope="all">Xem tất cả môn</button>');
  return `<section class="hero"><div><h1>Học từng nhánh,<br>lớn cả cây.</h1><p>${esc(getMajor(majorId)?.name || '')}</p></div>${heroArt}</section>
  <div class="section-head"><div class="segmented" role="group" aria-label="Phạm vi môn học">${scopes.map(([id, label]) =>
    `<button type="button" data-action="course-scope" data-scope="${id}" aria-pressed="${id === scope}">${esc(label)}</button>`).join('')}</div>
    <label class="searchbox">${ico('search', 20)}<input id="course-search" type="search" value="${esc(state.search)}" placeholder="Tên môn hoặc mã môn" aria-label="Tìm môn học"></label></div>
  ${list.length ? `<div class="course-grid">${list.map(courseCard).join('')}</div>` : none}`;
}
