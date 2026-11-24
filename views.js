/** Các hàm dựng HTML. Không gắn sự kiện: mọi thao tác đi qua data-action trong app.js. */
import {courses, nodes, stages, getCourse, getNode, nodesOf} from './data.js';
import {courseGuides} from './learning-guides.js';
import {lecturers} from './lecturers.js';
import {exams, examTerms} from './exams.js';
import {ico} from './icons.js';
import {missingPrereqs, nextStepTo, followers} from './learning-path.js';
import {local, state, courseIds, STATUS, getStatus, unlocked, mastered, isSaved, hasEmpathy, empathyCount} from './store.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));

const link = (path, cls, body, extra = '') => `<a class="${cls}" href="#/${path}" ${extra}>${body}</a>`;
const outside = (url, cls, body) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${body}</a>`;
const formatDate = s => {
  const time = Date.parse(s);
  return Number.isFinite(time) ? new Intl.DateTimeFormat('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(time) : '';
};
const empty = (icon, title, text = '', action = '') =>
  `<div class="empty">${ico(icon, 30)}<strong>${title}</strong>${text ? `<p>${text}</p>` : ''}${action}</div>`;

/* ---------- Khung trang ---------- */

const NAV = [['home', 'compass', 'Môn học'], ['community', 'message', 'Hỏi đáp'], ['my', 'bookmark', 'Của tôi']];
const activeNav = () => ['home', 'courses', 'course', 'node'].includes(state.route) ? 'home' : state.route;

export function shell(body) {
  const items = NAV.map(([route, icon, label]) =>
    link(route, 'nav-link', `${ico(icon, 20)}<span>${label}</span>`, activeNav() === route ? 'aria-current="page"' : '')).join('');
  return `<a class="skip-link" href="#main-content" data-action="skip">Tới nội dung</a>
  <header class="topbar"><div class="topbar-inner">
    ${link('home', 'brand', '<span class="brand-mark" aria-hidden="true">絆</span><span>kizuna</span>', 'aria-label="Kizuna, về trang môn học"')}
    <nav class="nav" aria-label="Điều hướng chính">${items}</nav>
  </div></header>
  <main class="content" id="main-content" tabindex="-1">${body}</main>
  <footer class="footer"><p>Bản thử nghiệm của sinh viên HUST. Nội dung mang tính tham khảo.</p>${link('help', 'footer-link', 'Trợ giúp và góp ý')}</footer>
  <div class="toast-stack" role="status" aria-live="polite"></div>${modal()}`;
}

/* ---------- Trang môn học ---------- */

const progressOf = courseId => {
  const list = nodesOf(courseId);
  const done = list.filter(n => mastered(n.id)).length;
  return {done, total: list.length, percent: Math.round(done / list.length * 100)};
};
const progressBar = ({percent}) => `<span class="bar" aria-hidden="true"><i style="width:${percent}%"></i></span>`;

function courseCard(c) {
  const p = progressOf(c.id);
  return link(`course/${c.id}`, 'course-card', `
    <span class="course-icon" style="--c:${c.color};--s:${c.soft}">${ico(c.icon, 28)}</span>
    <span class="course-code">${esc(c.code)}</span>
    <strong class="course-name">${esc(c.name)}</strong>
    <span class="course-short">${esc(c.short)}</span>
    <span class="course-foot">${progressBar(p)}<span>${p.done}/${p.total} chủ đề</span></span>`);
}

const heroArt = `<svg class="hero-art" viewBox="0 0 380 250" aria-hidden="true">
  <path class="thread" d="M52 128C110 128 104 58 166 58M52 128C110 128 104 196 166 196M166 58C224 58 222 128 284 128"/>
  <path class="thread dashed" d="M166 196C224 196 222 128 284 128"/>
  <g class="knot done"><circle cx="52" cy="128" r="32"/><path d="m39 128 9 9 18-19"/></g>
  <g class="knot done"><circle cx="166" cy="58" r="32"/><path d="m153 58 9 9 18-19"/></g>
  <g class="knot now"><circle cx="166" cy="196" r="32"/><path d="M160 184v24l18-12z"/></g>
  <g class="knot wait"><circle cx="300" cy="128" r="36"/><rect x="286" y="126" width="28" height="20" rx="5"/><path d="M291 126v-7a9 9 0 0 1 18 0v7"/></g>
</svg>`;

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

/* ---------- Trang một môn ---------- */

const TABS = [['map', 'Bản đồ kiến thức'], ['project', 'Bài tập lớn'], ['lecturers', 'Giảng viên & chấm điểm'], ['exams', 'Ôn thi']];
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

function mapCard(n) {
  const open = unlocked(n.id), status = getStatus(n.id);
  const kind = !open ? 'locked' : status || 'open';
  const missing = missingPrereqs(n.id, local.progress).map(m => m.title);
  const label = !open ? 'Chưa mở khóa' : STATUS[status] || 'Sẵn sàng học';
  const icon = {locked: 'lock', clear: 'check', stuck: 'help', explore: 'compass', open: 'arrow'}[kind];
  const body = `<span class="map-icon">${ico(icon, 18)}</span><span class="map-copy"><strong>${esc(n.title)}</strong><small>${open ? label : `Cần: ${esc(missing.join(' · '))}`}</small></span>`;
  const attrs = `data-map-node="${n.id}"`;
  return open
    ? link(`node/${n.id}`, `map-card status-${kind}`, body, `${attrs} aria-label="${esc(`${n.title}. ${label}`)}"`)
    : `<button type="button" class="map-card status-locked" ${attrs} data-action="locked" data-id="${n.id}" aria-label="${esc(`${n.title}. Chưa mở khóa, cần thông suốt ${missing.join(' · ')}`)}">${body}</button>`;
}

function mapTab(id) {
  const groups = stages.map((name, stage) => ({name, list: nodesOf(id).filter(n => n.stage === stage)})).filter(g => g.list.length);
  return `<section class="map" id="knowledge-map" aria-label="Bản đồ kiến thức"><svg class="map-edges" aria-hidden="true"></svg>
    <div class="map-track">${groups.map((g, i) => `<section class="map-stage"><h2><span>${i + 1}</span>${esc(g.name)}</h2><div class="map-nodes">${g.list.map(mapCard).join('')}</div></section>`).join('')}</div></section>
  <p class="map-legend"><span class="key key-clear">Đã thông suốt</span><span class="key key-open">Sẵn sàng học</span><span class="key key-locked">Chưa mở khóa</span></p>`;
}

function projectTab(id) {
  const g = courseGuides[id];
  return `<section class="stack"><div class="lead"><h2>${esc(g.scenario)}</h2><p>${esc(g.outcome)}</p><span class="tag">Đề bài mẫu</span></div>
  <ol class="steps">${g.project.map(s => {
    const n = getNode(s.node), open = unlocked(s.node);
    const target = open ? link(`node/${n.id}`, 'chip', `${ico('book', 16)} ${esc(n.title)}`)
      : `<button type="button" class="chip is-locked" data-action="locked" data-id="${n.id}">${ico('lock', 16)} ${esc(n.title)}</button>`;
    return `<li class="step"><h3>${esc(s.title)}</h3><p>${esc(s.detail)}</p><p class="step-out">${ico('check', 18)}<span>${esc(s.output)}</span></p>${target}</li>`;
  }).join('')}</ol>
  <div class="panel"><h3>Trước khi nộp</h3><ul class="checks">${g.deliverables.map((item, i) => {
    const key = `${id}:${i}:${item.slice(0, 12)}`;
    return `<li><label><input type="checkbox" data-guide-check="${esc(key)}" ${local.guideChecks[key] ? 'checked' : ''}><span>${esc(item)}</span></label></li>`;
  }).join('')}</ul></div>
  ${g.reference ? `<div class="panel"><h3>${esc(g.reference.title)}</h3><p>${esc(g.reference.description)}</p><div class="chips">${g.reference.links.map(l => outside(l.url, 'chip', `${esc(l.title)} ${ico('external', 15)}`)).join('')}</div></div>` : ''}</section>`;
}

const initials = name => name.split(' ').slice(-1)[0].slice(0, 1).toUpperCase();

function gradeBar(parts) {
  if (!parts.length) return '';
  return `<div class="grade-bar" aria-hidden="true">${parts.map((g, i) => `<i class="g${i}" style="flex:${g.weight}"></i>`).join('')}</div>
  <ul class="grade-key">${parts.map((g, i) => `<li><i class="g${i}"></i>${esc(g.label)} <strong>${g.weight}%</strong></li>`).join('')}</ul>`;
}

function lecturerCard(l) {
  const facts = [['Tính cách', l.style], ['Điểm danh', l.attendance], ['Bài tập', l.homework], ['Lưu ý', l.rules]];
  const badge = l.kind === 'sample' ? '<span class="tag tag-sample">Dữ liệu mẫu</span>' : `<span class="tag tag-public">${esc(l.asOf)}</span>`;
  return `<article class="lecturer"><header><span class="avatar" aria-hidden="true">${esc(initials(l.name))}</span><div><h3>${esc(l.name)}</h3><p>${esc(l.role)}</p></div>${badge}</header>
  <section class="grading"><h4>Cách chấm điểm</h4>${gradeBar(l.grading)}<p>${esc(l.gradingNote)}</p></section>
  <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd class="${v ? '' : 'unknown'}">${v ? esc(v) : 'Chưa có thông tin'}</dd></div>`).join('')}</dl>
  ${l.sources.length ? `<footer>${l.sources.map(s => outside(s.url, 'text-link', `${esc(s.title)} ${ico('external', 15)}`)).join('')}</footer>` : ''}</article>`;
}

const lecturersTab = id => `<section class="stack"><p class="note">Cách chấm có thể đổi theo học kỳ. Hãy đối chiếu với đề cương lớp bạn.</p>
  <div class="lecturer-grid">${lecturers[id].map(lecturerCard).join('')}</div></section>`;

function examsTab(id) {
  const term = state.examTerm, set = exams[id][term];
  const label = examTerms.find(([key]) => key === term)[1].toLowerCase();
  const papers = set.papers.length
    ? `<ul class="papers">${set.papers.map(p => `<li>${outside(p.url, 'paper', `<span class="paper-icon">${ico('file', 22)}</span><span><strong>${esc(p.title)}</strong><small>${esc(p.detail)}</small></span>${ico('external', 18)}`)}</li>`).join('')}</ul>${set.note ? `<p class="note">${esc(set.note)}</p>` : ''}`
    : empty('file', `Chưa có đề ${label} các năm trước`, 'Bạn có thể luyện với đề tự luyện bên dưới.');
  return `<section class="stack"><div class="segmented" role="group" aria-label="Chọn kỳ thi">${examTerms.map(([key, name]) =>
    `<button type="button" data-action="exam-term" data-term="${key}" aria-pressed="${key === term}">${name}</button>`).join('')}</div>
  <div><h2>Đề các năm trước</h2>${papers}</div>
  <div><h2>${esc(set.practice.title)}</h2><p class="sub">${set.practice.questions.length} câu · ${esc(set.practice.time)} · Kizuna biên soạn</p>
  <ol class="exam-list">${set.practice.questions.map((item, i) => {
    const key = `${id}:${term}:${i}`, open = state.openAnswers.has(key), node = getNode(item.node);
    const review = unlocked(node.id) ? link(`node/${node.id}`, 'text-link', `Ôn lại: ${esc(node.title)}`) : `<span class="muted">Thuộc chủ đề: ${esc(node.title)}</span>`;
    return `<li class="exam-q"><p class="exam-text">${esc(item.q)}</p>${open ? `<div class="answer">${esc(item.a).replaceAll('\\r\\n', '<br>')}</div>` : ''}
    <div class="row"><button type="button" class="btn btn-soft" data-action="exam-answer" data-key="${key}" aria-expanded="${open}">${open ? 'Ẩn đáp án' : 'Xem đáp án'}</button>${review}</div></li>`;
  }).join('')}</ol></div></section>`;
}

/* ---------- Trang Node ---------- */

const resource = (r, main = false) => outside(r.url, `resource ${main ? 'is-main' : ''}`,
  `<span class="paper-icon">${ico('book', 22)}</span><span><strong>${esc(r.title)}</strong><small>${main ? 'Nên đọc trước' : 'Đọc thêm'}</small></span>${ico('external', 18)}`);

function lockedPage(n, c) {
  const missing = missingPrereqs(n.id, local.progress), next = nextStepTo(n.id, local.progress);
  return `${link(`course/${c.id}`, 'back-link', `${ico('back', 18)} ${esc(c.name)}`)}
  <section class="locked-page"><span class="lock-mark">${ico('lock', 34)}</span><h1>${esc(n.title)}</h1><p>Chủ đề này mở khóa khi bạn thông suốt:</p>
  <ul>${missing.map(m => `<li>${ico(unlocked(m.id) ? 'compass' : 'lock', 18)} ${esc(m.title)}</li>`).join('')}</ul>
  ${link(`node/${next.id}`, 'btn btn-primary', `Học ${esc(next.title)}`)}</section>`;
}

function unlockPanel(n) {
  if (!mastered(n.id)) return '';
  const next = followers(n.id);
  if (!next.length) return `<div class="unlock"><strong>${ico('check', 20)} Bạn đã hoàn thành nhánh này.</strong>${link(`course/${n.courseId}`, 'btn btn-primary', 'Về bản đồ')}</div>`;
  return `<div class="unlock"><strong>${ico('unlock', 20)} Học tiếp</strong><div class="chips">${next.map(f => unlocked(f.id)
    ? link(`node/${f.id}`, 'chip', `${esc(f.title)} ${ico('arrow', 16)}`)
    : `<button type="button" class="chip is-locked" data-action="locked" data-id="${f.id}">${ico('lock', 16)} ${esc(f.title)}</button>`).join('')}</div></div>`;
}

const NODE_STEPS = ['Tóm tắt khái niệm', 'Tài liệu chọn lọc', 'Cảnh báo bẫy', 'Flash-check', 'Hỏi đáp', 'Tự đánh giá'];

export function nodePage(id) {
  const n = getNode(id), c = getCourse(n.courseId);
  if (!unlocked(id)) return lockedPage(n, c);
  const selected = getStatus(id), questions = state.qa.questions.filter(q => q.nodeId === id);
  const index = Math.max(0, Math.min(n.flash.length - 1, state.flashIndex[id] || 0)), flash = n.flash[index];
  const shown = local.answers[id]?.includes(index), voted = hasEmpathy('node', id);
  const [main, ...more] = n.resources;

  const bodies = [
    `<p class="summary">${esc(n.summary)}</p>`,
    `${resource(main, true)}${more.map(r => resource(r)).join('')}`,
    `<div class="pitfall">${ico('alert', 22)}<p>${esc(n.pitfall)}</p></div>`,
    `<div class="flash"><p class="flash-q">${esc(flash.q)}</p>${shown ? `<div class="answer">${esc(flash.a)}</div>` : ''}
      <div class="row"><button type="button" class="btn btn-soft" data-action="quiz-toggle" data-id="${id}" data-index="${index}" aria-expanded="${Boolean(shown)}">${shown ? 'Ẩn giải thích' : 'Xem giải thích'}</button>
      ${n.flash.length > 1 ? `<span class="pager"><button type="button" class="icon-btn" aria-label="Câu trước" data-action="flash-step" data-id="${id}" data-step="-1" ${index === 0 ? 'disabled' : ''}>${ico('back', 20)}</button>${index + 1}/${n.flash.length}<button type="button" class="icon-btn" aria-label="Câu sau" data-action="flash-step" data-id="${id}" data-step="1" ${index === n.flash.length - 1 ? 'disabled' : ''}>${ico('chevron', 20)}</button></span>` : ''}</div></div>`,
    `${state.qaError ? offlineNote() : ''}<div class="row"><button type="button" class="btn btn-primary" data-action="ask" data-node="${id}">${ico('plus', 18)} Đặt câu hỏi</button>
      <button type="button" class="btn btn-ghost ${voted ? 'is-voted' : ''}" data-action="empathy" data-type="node" data-id="${id}" ${voted ? 'disabled' : ''}>${ico('heart', 18)} Tôi cũng đang kẹt · ${empathyCount('node', id)}</button></div>
      ${questions.length ? `<div class="q-list">${(state.qaExpanded ? questions : questions.slice(0, 2)).map(q => questionCard(q)).join('')}</div>` : ''}
      ${questions.length > 2 ? `<button type="button" class="text-link" data-action="qa-show-more">${state.qaExpanded ? 'Thu gọn' : `Xem tất cả ${questions.length} câu hỏi`}</button>` : ''}`,
    `<div class="status-row" role="group" aria-label="Mức độ hiểu">${[['explore', 'compass'], ['stuck', 'help'], ['clear', 'check']].map(([value, icon]) =>
      `<button type="button" class="status-btn ${value}" data-action="set-status" data-id="${id}" data-status="${value}" aria-pressed="${selected === value}">${ico(icon, 20)} ${STATUS[value]}</button>`).join('')}</div>${unlockPanel(n)}`
  ];
  return `${link(`course/${c.id}`, 'back-link', `${ico('back', 18)} ${esc(c.name)}`)}
  <div class="node-layout"><aside class="toc" aria-label="Các mục"><ol>${NODE_STEPS.map((name, i) => `<li><button type="button" data-action="jump" data-target="step-${i + 1}">${name}</button></li>`).join('')}</ol></aside>
  <article class="node"><header class="node-head"><h1>${esc(n.title)}</h1><button type="button" class="icon-btn ${isSaved(id) ? 'is-on' : ''}" aria-label="${isSaved(id) ? 'Bỏ lưu' : 'Lưu'} chủ đề" aria-pressed="${isSaved(id)}" data-action="save" data-id="${id}">${ico('bookmark', 22)}</button></header>
  ${NODE_STEPS.map((name, i) => `<section class="node-step" id="step-${i + 1}"><h2><span>${i + 1}</span>${name}</h2>${bodies[i]}</section>`).join('')}</article></div>`;
}

/* ---------- Hỏi đáp ---------- */

const offlineNote = () => `<p class="note note-warn">Chưa kết nối được kho hỏi đáp. <button type="button" class="text-link" data-action="retry">Thử lại</button></p>`;

function questionCard(q, showNode = false) {
  const node = getNode(q.nodeId), open = state.expanded.has(q.id), voted = hasEmpathy('question', q.id);
  const replies = state.qa.replies.filter(r => r.questionId === q.id);
  const topic = node ? (unlocked(node.id) ? link(`node/${node.id}`, 'q-topic', esc(node.title)) : `<span class="q-topic">${esc(node.title)}</span>`) : esc(getCourse(q.courseId)?.name || '');
  return `<article class="question"><p class="q-meta">${esc(q.alias)} · ${formatDate(q.createdAt)}${q.demo ? ' · Minh họa' : ''}</p>
  <h3>${esc(q.title || 'Câu hỏi chưa có tiêu đề')}</h3>${q.body ? `<p>${esc(q.body)}</p>` : ''}${showNode && topic ? `<p class="q-topic-row">${topic}</p>` : ''}
  <div class="row"><button type="button" class="btn-mini ${voted ? 'is-voted' : ''}" ${voted ? 'disabled' : ''} data-action="empathy" data-type="question" data-id="${q.id}">${ico('heart', 17)} Tôi cũng đang kẹt · ${q.empathyCount || 0}</button>
  <button type="button" class="btn-mini" data-action="toggle-answers" data-id="${q.id}" aria-expanded="${open}">${ico('message', 17)} ${replies.length} phản hồi</button>
  <button type="button" class="btn-mini q-report" aria-label="Báo cáo nội dung" title="Báo cáo nội dung" data-action="report" data-id="${q.id}">${ico('flag', 17)}</button></div>
  ${open ? `<div class="replies">${replies.map(r => `<div class="reply"><p class="q-meta">${esc(r.alias)} · ${formatDate(r.createdAt)}</p><p>${esc(r.body)}</p></div>`).join('')}<button type="button" class="btn btn-soft" data-action="reply" data-id="${q.id}" data-node="${node?.id || ''}">Viết phản hồi</button></div>` : ''}</article>`;
}

export function communityPage() {
  const q = state.communitySearch.toLowerCase().trim();
  const list = state.qa.questions.filter(x => (state.communityFilter === 'all' || (getNode(x.nodeId)?.courseId || x.courseId) === state.communityFilter)
    && [x.title, x.body, getNode(x.nodeId)?.title, getCourse(x.courseId)?.name].join(' ').toLowerCase().includes(q));
  return `<div class="narrow"><div class="section-head"><h1>Hỏi đáp</h1><button type="button" class="btn btn-primary" data-action="ask">${ico('plus', 18)} Đặt câu hỏi mới</button></div>
  ${state.qaError ? offlineNote() : ''}
  <label class="searchbox wide">${ico('search', 20)}<input id="qa-search" type="search" placeholder="Tìm câu hỏi" value="${esc(state.communitySearch)}" aria-label="Tìm câu hỏi"></label>
  <div class="pills" role="group" aria-label="Lọc theo môn">${[['all', 'Tất cả'], ...courses.map(c => [c.id, c.name])].map(([id, name]) =>
    `<button type="button" class="pill" aria-pressed="${state.communityFilter === id}" data-action="qa-filter" data-value="${id}">${esc(name)}</button>`).join('')}</div>
  ${list.length ? `<div class="q-list">${list.map(x => questionCard(x, true)).join('')}</div>` : empty('message', 'Chưa có câu hỏi phù hợp')}</div>`;
}

/* ---------- Của tôi ---------- */

export function myPage() {
  const list = nodes.filter(n => isSaved(n.id) || (getStatus(n.id) && getStatus(n.id) !== 'clear'));
  const groups = courses.map(c => ({c, list: list.filter(n => n.courseId === c.id)})).filter(g => g.list.length);
  return `<div class="narrow"><h1>Của tôi</h1>
  ${groups.length ? groups.map(({c, list: items}) => `<section class="my-group"><h2>${esc(c.name)}</h2><ul class="papers">${items.map(n =>
    `<li>${link(`node/${n.id}`, 'paper', `<span class="paper-icon">${ico(unlocked(n.id) ? isSaved(n.id) ? 'bookmark' : 'compass' : 'lock', 22)}</span><span><strong>${esc(n.title)}</strong><small>${STATUS[getStatus(n.id)] || 'Đã lưu'}</small></span>${ico('chevron', 18)}`)}</li>`).join('')}</ul></section>`).join('')
    : empty('bookmark', 'Chưa có chủ đề nào', 'Chủ đề bạn lưu hoặc đang học dở sẽ ở đây.', link('home', 'btn btn-primary', 'Chọn môn học'))}
  <details class="backup"><summary>Sao lưu tiến độ</summary><p>Tiến độ chỉ lưu trên trình duyệt này.</p><div class="row"><button type="button" class="btn btn-ghost" data-action="export">Xuất tệp</button><button type="button" class="btn btn-ghost" data-action="import">Nhập tệp</button><input type="file" id="import-input" accept="application/json" hidden></div></details></div>`;
}

/* ---------- Trợ giúp ---------- */

export const helpPage = () => `<div class="narrow stack"><h1>Trợ giúp và góp ý</h1>
  <div class="panel"><h2>Cách mở khóa chủ đề</h2><p>Mỗi chủ đề có thể cần một hoặc nhiều chủ đề học trước. Khi bạn chọn “Đã thông suốt” cho tất cả, chủ đề tiếp theo sẽ mở. Nếu đổi lại trạng thái, các chủ đề phía sau tạm khóa, tiến độ đã lưu vẫn còn.</p></div>
  <div class="panel"><h2>Ẩn danh đến đâu?</h2><p>Câu hỏi hiển thị công khai dưới biệt danh ngẫu nhiên. Bản thử nghiệm chưa có đăng nhập và chưa kiểm duyệt chủ động, vì vậy đừng gửi thông tin cá nhân nhạy cảm.</p></div>
  <div class="panel"><h2>Nội dung lấy từ đâu?</h2><p>Tài liệu và đề thi là nguồn công khai do nhóm chọn, chưa được giảng viên hay HUST xác nhận. Mục gắn nhãn “Dữ liệu mẫu” là hư cấu để minh họa.</p></div>
  <div class="panel"><h2>Góp ý cho nhóm</h2><form id="feedback-form"><div class="field"><label for="feedback-rating">Trải nghiệm của bạn</label><select id="feedback-rating" name="rating" required><option value="">Chọn một mức</option><option value="dễ dùng">Dễ dùng</option><option value="bình thường">Bình thường</option><option value="khó dùng">Khó dùng</option></select></div>
  <div class="field"><label for="feedback-text">Bạn muốn cải thiện điều gì?</label><textarea id="feedback-text" name="text" minlength="8" maxlength="1200" required></textarea></div><button type="submit" class="btn btn-primary">Gửi góp ý ẩn danh</button></form></div></div>`;

export const notFound = () => empty('compass', 'Không tìm thấy trang này', '', link('home', 'btn btn-primary', 'Về trang môn học'));

/* ---------- Hộp thoại ---------- */

export const topicOptions = courseId => `<option value="">Chọn chủ đề</option>${courseIds.has(courseId) ? nodesOf(courseId).map(n => `<option value="${esc(n.id)}">${esc(n.title)}</option>`).join('') : ''}`;

function askForm(m) {
  const node = getNode(m.nodeId), courseId = node?.courseId || (courseIds.has(m.courseId) ? m.courseId : '');
  const choice = node
    ? `<p class="sub">${esc(getCourse(node.courseId).name)} · ${esc(node.title)}</p><input type="hidden" name="nodeId" value="${esc(node.id)}">`
    : `<div class="field-pair"><div class="field"><label for="ask-course">Môn học</label><select name="courseId" id="ask-course"><option value="">Chọn môn học</option>${courses.map(c => `<option value="${c.id}" ${c.id === courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="ask-node">Chủ đề</label><select name="nodeId" id="ask-node" ${courseId ? '' : 'disabled'}>${topicOptions(courseId)}</select></div></div>`;
  return `<h2>Đặt câu hỏi ẩn danh</h2><form id="ask-form">${choice}
    <div class="field"><label for="ask-title">Bạn đang vướng điều gì?</label><input name="title" id="ask-title" maxlength="120" placeholder="Vì sao recv() không nhận đủ byte?"></div>
    <div class="field"><label for="ask-body">Bạn đã thử gì?</label><textarea name="body" id="ask-body" maxlength="1500"></textarea></div>
    <p class="sub">Câu hỏi hiển thị công khai. Đừng ghi tên thật, email hoặc mã sinh viên.</p>
    <button class="btn btn-primary btn-block" type="submit">Gửi câu hỏi</button></form>`;
}

function modal() {
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
