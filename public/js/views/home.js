/** Trang chọn môn học. */
import {courses} from '../content/courses.js';
import {state} from '../core/store.js';
import {esc, link, empty} from './helpers.js';
import {heroArt} from './hero-art.js';
import {ico} from './icons.js';
import {progressOf, progressBar} from './progress.js';

function courseCard(c) {
  const p = progressOf(c.id);
  return link(`course/${c.id}`, 'course-card', `
    <span class="course-icon" style="--c:${c.color};--s:${c.soft}">${ico(c.icon, 28)}</span>
    <span class="course-code">${esc(c.code)}</span>
    <strong class="course-name">${esc(c.name)}</strong>
    <span class="course-short">${esc(c.short)}</span>
    <span class="course-foot">${progressBar(p)}<span>${p.done}/${p.total} chủ đề</span></span>`);
}
export function homePage() {
  const q = state.search.toLowerCase().trim();
  const list = courses.filter(c => [c.name, c.code, c.short, ...c.tags].join(' ').toLowerCase().includes(q));
  return `<section class="hero"><div><h1>Học từng mắt xích,<br>nắm chắc cả môn.</h1>
    <p>Thông suốt một chủ đề để mở khóa chủ đề tiếp theo. Tài liệu, cách chấm và đề ôn nằm cùng một chỗ.</p></div>${heroArt}</section>
  <div class="section-head"><h2>Chọn môn học</h2>
    <label class="searchbox">${ico('search', 20)}<input id="course-search" type="search" value="${esc(state.search)}" placeholder="Tên môn hoặc mã môn" aria-label="Tìm môn học"></label></div>
  ${list.length ? `<div class="course-grid">${list.map(courseCard).join('')}</div>`
    : empty('search', 'Không tìm thấy môn phù hợp', '', '<button class="btn btn-ghost" data-action="reset-courses">Xóa tìm kiếm</button>')}`;
}
