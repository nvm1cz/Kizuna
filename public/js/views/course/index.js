/** Trang một môn: tiêu đề và 4 mục. Mỗi mục nằm trong một file cùng thư mục. */
import {getCourse} from '../../content/courses.js';
import {state} from '../../core/store.js';
import {esc, link} from '../helpers.js';
import {ico} from '../icons.js';
import {progressOf, progressBar} from '../progress.js';
import {mapTab} from './map.js';
import {projectTab} from './project.js';
import {lecturersTab} from './lecturers.js';
import {examsTab} from './exams.js';

const TABS = [['map', 'Bản đồ kiến thức'], ['project', 'Bài tập lớn'], ['lecturers', 'Giảng viên'], ['exams', 'Ôn thi']];
const courseTab = () => TABS.some(([id]) => id === state.segments[2]) ? state.segments[2] : 'map';

export function coursePage(id) {
  const c = getCourse(id), tab = courseTab(), p = progressOf(id);
  const body = {map: mapTab, project: projectTab, lecturers: lecturersTab, exams: examsTab}[tab](id);
  return `${link('home', 'back-link', `${ico('back', 18)} Môn học`)}
  <header class="course-head"><span class="course-icon" style="--c:${c.color};--s:${c.soft}">${ico(c.icon, 32)}</span>
    <div class="course-title"><span class="course-code">${esc(c.code)}</span><h1>${esc(c.name)}</h1></div>
    <div class="course-progress">${progressBar(p)}<span>${p.done}/${p.total} đã thông suốt</span></div></header>
  <nav class="tabs" aria-label="Nội dung môn học">${TABS.map(([key, name]) =>
    link(`course/${id}${key === 'map' ? '' : '/' + key}`, 'tab', name, key === tab ? 'aria-current="page"' : '')).join('')}</nav>
  ${body}`;
}
