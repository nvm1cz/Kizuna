/** Router, sự kiện và gọi API. Giao diện nằm ở views.js, trạng thái ở store.js. */
import {getNode, nodesOf} from './data.js';
import {followers, missingPrereqs} from './learning-path.js';
import {local, state, persist, courseIds, nodeIds, unlocked, mastered, isSaved, hasEmpathy, exportPayload, importPayload} from './store.js';
import {shell, homePage, coursePage, nodePage, communityPage, myPage, helpPage, notFound, topicOptions} from './views.js';

const APP = document.getElementById('app');
const calm = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior: calm() ? 'auto' : 'smooth', block: 'start'});

/* ---------- Hiển thị ---------- */

function currentPage() {
  const [route, id] = state.segments;
  if (route === 'home' || route === 'courses') return homePage();
  if (route === 'course' && courseIds.has(id)) return coursePage(id);
  if (route === 'node' && nodeIds.has(id)) return nodePage(id);
  return (new Map([['community', communityPage], ['my', myPage], ['help', helpPage]]).get(route) || notFound)();
}

function render(keepScroll = true) {
  const top = keepScroll ? window.scrollY : 0;
  const bits = (location.hash || '#/home').replace(/^#\/?/, '').split('/').filter(Boolean);
  state.segments = bits.length ? bits : ['home'];
  state.route = state.segments[0];
  APP.innerHTML = shell(currentPage());
  document.body.style.overflow = state.modal ? 'hidden' : '';
  requestAnimationFrame(() => { drawEdges(); if (keepScroll) window.scrollTo(0, top); });
}

function notify(text, bad = false) {
  const host = document.querySelector('.toast-stack');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' is-error' : '');
  el.textContent = text;
  host.append(el);
  setTimeout(() => el.remove(), 4200);
}

/** Vẽ sợi nối giữa các Node trên màn hình rộng. Sợi liền = đã thông suốt Node phía trước. */
function drawEdges() {
  const panel = document.getElementById('knowledge-map');
  const svg = panel?.querySelector('.map-edges');
  if (!svg) return;
  svg.replaceChildren();
  if (window.matchMedia?.('(max-width: 1023px)').matches) return;
  const box = panel.getBoundingClientRect();
  if (!box.width) return;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const rectOf = id => panel.querySelector(`[data-map-node="${id}"]`)?.getBoundingClientRect();
  for (const node of nodesOf(state.segments[1])) for (const dep of node.deps) {
    const a = rectOf(dep), b = rectOf(node.id);
    if (!a || !b) continue;
    let d;
    if (getNode(dep).stage === node.stage) {
      const x = a.left - box.left + 34;
      d = `M${x} ${a.bottom - box.top}V${b.top - box.top}`;
    } else {
      const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top, x2 = b.left - box.left, y2 = b.top + b.height / 2 - box.top;
      const bend = Math.max(18, (x2 - x1) * .5);
      d = `M${x1} ${y1}C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge' + (mastered(dep) ? ' is-done' : ''));
    path.dataset.from = dep;
    path.dataset.to = node.id;
    svg.append(path);
  }
}

/** Rê chuột hoặc focus vào một Node để làm nổi các sợi nối liên quan. */
function highlight(id) {
  for (const path of document.querySelectorAll?.('.map-edges .edge') || []) {
    path.classList.toggle('is-hot', Boolean(id) && (path.dataset.from === id || path.dataset.to === id));
  }
}

/* ---------- API cộng đồng ---------- */

async function apiPost(payload) {
  const res = await fetch('/api/community', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...payload, actorId: local.device})});
  const data = await res.json().catch(() => ({error: 'Phản hồi không hợp lệ.'}));
  if (!res.ok) throw new Error(data.error || 'Không thể thực hiện.');
  return data;
}

async function loadCommunity(silent = false) {
  try {
    const res = await fetch('/api/community', {headers: {'x-kizuna-device': local.device}, cache: 'no-store'});
    if (!res.ok) throw Error('offline');
    const qa = await res.json();
    if (!Array.isArray(qa.questions)) throw Error('invalid');
    state.qa = qa;
    state.qaError = false;
  } catch {
    state.qaError = true;
  }
  render();
  if (state.qaError && !silent) notify('Chưa kết nối được cộng đồng.', true);
}

async function empathize(el) {
  const {type, id} = el.dataset;
  if (state.busy || hasEmpathy(type, id)) return;
  if (state.qaError) return notify('Chưa kết nối được để ghi nhận.', true);
  state.busy = true;
  el.disabled = true;
  try {
    await apiPost({action: 'empathize', targetType: type, targetId: id});
    await loadCommunity(true);
  } catch (e) {
    el.disabled = false;
    notify(e.message, true);
  } finally {
    state.busy = false;
  }
}

/* ---------- Thao tác học ---------- */

function setStatus(id, status) {
  if (!unlocked(id)) return;
  const before = new Set(nodesOf(getNode(id).courseId).filter(n => unlocked(n.id)).map(n => n.id));
  local.progress[id] = status;
  persist();
  render();
  const opened = followers(id).filter(n => unlocked(n.id) && !before.has(n.id));
  const closed = [...before].filter(other => !unlocked(other));
  if (opened.length) notify(`Đã mở khóa: ${opened.map(n => n.title).join(' · ')}`);
  else if (closed.length) notify(`${closed.length} chủ đề phía sau tạm khóa.`);
}

function explainLock(id) {
  const missing = missingPrereqs(id, local.progress);
  notify(`Hãy thông suốt trước: ${missing.map(n => n.title).join(' · ')}`);
  for (const n of missing) {
    const card = document.querySelector(`[data-map-node="${n.id}"]`);
    if (!card) continue;
    card.classList.add('is-needed');
    setTimeout(() => card.classList.remove('is-needed'), 1800);
  }
}

function exportData() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(exportPayload(), null, 2)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kizuna-tien-do.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importData(file) {
  if (!file) return;
  try {
    if (file.size > 100000) throw Error('Tệp quá lớn.');
    importPayload(JSON.parse(await file.text()));
    render();
    notify('Đã nhập tiến độ.');
  } catch (e) {
    notify(e instanceof SyntaxError ? 'Tệp không đúng định dạng.' : e.message, true);
  }
}

/* ---------- Sự kiện ---------- */

function openModal(type, data = {}) {
  state.modal = {type, ...data};
  render();
  requestAnimationFrame(() => document.querySelector('.modal input:not([type=hidden]),.modal textarea')?.focus());
}
const closeModal = () => { state.modal = null; render(); };
const toggle = (set, key) => set.has(key) ? set.delete(key) : set.add(key);

const actions = {
  'locked': el => explainLock(el.dataset.id),
  'set-status': el => setStatus(el.dataset.id, el.dataset.status),
  'exam-term': el => { state.examTerm = el.dataset.term; render(); },
  'exam-answer': el => { toggle(state.openAnswers, el.dataset.key); render(); },
  'flash-step': el => {
    const {id, step} = el.dataset, last = getNode(id).flash.length - 1;
    state.flashIndex[id] = Math.max(0, Math.min(last, (state.flashIndex[id] || 0) + Number(step)));
    render();
  },
  'quiz-toggle': el => {
    const set = new Set(local.answers[el.dataset.id] || []);
    toggle(set, Number(el.dataset.index));
    local.answers[el.dataset.id] = [...set];
    persist();
    render();
  },
  'save': el => {
    const {id} = el.dataset;
    local.saved = isSaved(id) ? local.saved.filter(x => x !== id) : [...local.saved, id];
    persist();
    render();
  },
  'jump': el => scrollTo(el.dataset.target),
  'skip': (el, ev) => { ev.preventDefault?.(); document.getElementById('main-content')?.focus(); },
  'reset-courses': () => { state.search = ''; render(); },
  'qa-filter': el => { state.communityFilter = el.dataset.value; render(); },
  'qa-show-more': () => { state.qaExpanded = !state.qaExpanded; render(); },
  'toggle-answers': el => { toggle(state.expanded, el.dataset.id); render(); },
  'empathy': empathize,
  'ask': el => openModal('ask', {nodeId: el.dataset.node || null, courseId: state.communityFilter}),
  'reply': el => openModal('reply', {questionId: el.dataset.id, nodeId: el.dataset.node}),
  'report': el => openModal('report', {questionId: el.dataset.id}),
  'close-modal': closeModal,
  'overlay': (el, ev) => { if (ev.target === el) closeModal(); },
  'retry': () => loadCommunity(),
  'export': exportData,
  'import': () => document.getElementById('import-input')?.click()
};

const submits = {
  'ask-form': async form => {
    const nodeId = state.modal.nodeId || String(form.get('nodeId') || '');
    const courseId = getNode(nodeId)?.courseId || String(form.get('courseId') || '');
    await apiPost({action: 'ask', nodeId, courseId, title: form.get('title') || '', body: form.get('body') || ''});
    state.modal = null;
    if (state.route === 'community') { state.communityFilter = 'all'; state.communitySearch = ''; }
    await loadCommunity(true);
    notify('Đã đăng câu hỏi.');
  },
  'reply-form': async form => {
    const {questionId, nodeId} = state.modal;
    await apiPost({action: 'reply', questionId, nodeId, body: form.get('body')});
    state.expanded.add(questionId);
    state.modal = null;
    await loadCommunity(true);
    notify('Đã đăng phản hồi.');
  },
  'report-form': async form => {
    await apiPost({action: 'report', questionId: state.modal.questionId, reason: form.get('reason')});
    closeModal();
    notify('Đã gửi báo cáo.');
  },
  'feedback-form': async (form, el) => {
    await apiPost({action: 'feedback', rating: form.get('rating'), text: form.get('text')});
    el.reset();
    notify('Cảm ơn bạn đã góp ý.');
  }
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-action]');
  if (el) actions[el.dataset.action]?.(el, ev);
});

document.addEventListener('submit', async ev => {
  const el = ev.target, run = submits[el.id];
  if (!run) return;
  ev.preventDefault();
  if (state.busy) return;
  if (state.qaError) return notify('Chưa kết nối được cộng đồng. Hãy thử lại.', true);
  const button = el.querySelector('button[type="submit"]');
  state.busy = true;
  if (button) button.disabled = true;
  try {
    await run(new FormData(el), el);
  } catch (e) {
    notify(e.message, true);
  } finally {
    state.busy = false;
    if (button) button.disabled = false;
  }
});

document.addEventListener('input', ev => {
  const key = {'course-search': 'search', 'qa-search': 'communitySearch'}[ev.target.id];
  if (!key) return;
  const {id, value, selectionStart} = ev.target;
  state[key] = value;
  if (ev.isComposing) return; // không cắt ngang bộ gõ tiếng Việt
  render();
  const input = document.getElementById(id);
  input?.focus();
  try { input?.setSelectionRange(selectionStart, selectionStart); } catch { /* trình duyệt không hỗ trợ */ }
});
document.addEventListener('compositionend', ev => {
  if (['course-search', 'qa-search'].includes(ev.target.id)) ev.target.dispatchEvent(new Event('input', {bubbles: true}));
});

document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.id === 'ask-course') {
    const topic = document.getElementById('ask-node');
    if (topic) { topic.innerHTML = topicOptions(el.value); topic.disabled = !courseIds.has(el.value); }
  } else if (el.id === 'import-input') {
    importData(el.files?.[0]);
  } else if (el.matches('[data-guide-check]')) {
    local.guideChecks[el.dataset.guideCheck] = el.checked;
    persist();
  }
});

document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && state.modal) closeModal(); });
for (const [on, off] of [['pointerover', 'pointerout'], ['focusin', 'focusout']]) {
  document.addEventListener(on, ev => { const card = ev.target.closest?.('[data-map-node]'); if (card) highlight(card.dataset.mapNode); });
  document.addEventListener(off, ev => { if (ev.target.closest?.('[data-map-node]')) highlight(null); });
}
window.addEventListener('resize', drawEdges);
window.addEventListener('hashchange', () => {
  state.modal = null;
  state.qaExpanded = false;
  render(false);
  window.scrollTo(0, 0);
});

persist();
render();
loadCommunity(true);
document.fonts?.ready?.then(drawEdges);
