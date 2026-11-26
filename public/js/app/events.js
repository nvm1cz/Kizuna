/** Gắn sự kiện. Nút bấm dùng data-action="tên", tra trong bảng actions. */
import {getNode} from '../core/catalog.js';
import {local, state} from '../core/store.js';
import {majorOptions, topicOptions} from '../views/helpers.js';
import {adminActions, adminSubmits, pickFile} from './admin-flow.js';
import {authSubmits, enter, saveProfile, setAuthMode, showAuthError, signOut} from './auth-flow.js';
import {communitySubmits, empathize, loadCommunity} from './community-flow.js';
import {contributeSubmits, openFile} from './contribute-flow.js';
import {showPicked} from './dropzone-flow.js';
import {drawEdges, highlight} from './map-edges.js';
import {openNotice, readAll} from './notice-flow.js';
import {setPeriod, toggleRanking} from './ranking-flow.js';
import {closeModal, notify, openModal, render} from './render.js';
import {enterRoute} from './route-flow.js';
import {runtime} from './runtime.js';
import {explainLock, setStatus} from './study-flow.js';

const calm = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior: calm() ? 'auto' : 'smooth', block: 'start'});
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
    runtime.sync.stateChanged();
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
  'reply': el => openModal('reply', {questionId: el.dataset.id}),
  'report': el => openModal('report', {questionId: el.dataset.id}),
  'close-modal': closeModal,
  'overlay': (el, ev) => { if (ev.target === el) closeModal(); },
  'retry': () => loadCommunity(),
  'auth-mode': el => {
    const typed = document.getElementById('auth-email')?.value;
    if (typed !== undefined) state.auth.email = typed.trim();
    setAuthMode(el.dataset.mode);
  },
  'show-password': el => {
    const input = document.getElementById(el.dataset.target), show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    el.textContent = show ? 'Ẩn' : 'Hiện';
    el.setAttribute('aria-pressed', show);
  },
  'retry-account': () => enter(state.user),
  'sign-out': signOut,
  'course-scope': el => { state.courseScope = el.dataset.scope; render(); },
  'toggle-ranking': toggleRanking,
  'board-period': el => setPeriod(el.dataset.period),
  'open-file': el => openFile(el.dataset.path),
  'open-notice': el => openNotice(el.dataset.id, el.dataset.link),
  'read-all': readAll,
  ...adminActions
};

const submits = {'profile-form': saveProfile, ...communitySubmits, ...contributeSubmits, ...adminSubmits};
const NEEDS_COMMUNITY = ['ask-form', 'reply-form', 'report-form'];

document.addEventListener('click', ev => {
  for (const menu of document.querySelectorAll('.account[open],.bell[open]')) if (!menu.contains(ev.target) || ev.target.closest('a')) menu.removeAttribute('open');
  const el = ev.target.closest('[data-action]');
  if (el) actions[el.dataset.action]?.(el, ev);
});

document.addEventListener('submit', async ev => {
  const el = ev.target, isAuth = el.id === 'auth-form', id = el.dataset?.form || el.id, run = isAuth ? authSubmits[state.auth.mode] : submits[id];
  if (!run) return;
  ev.preventDefault();
  if (state.busy) return;
  if (isAuth) showAuthError('');
  else if (state.qaError && NEEDS_COMMUNITY.includes(id)) return notify('Chưa kết nối được cộng đồng. Hãy thử lại.', true);
  const data = new FormData(el, ev.submitter ?? undefined); // đọc trước khi khóa nút, nút bị khóa sẽ không nằm trong dữ liệu
  const button = el.querySelector('button[type="submit"]');
  state.busy = true;
  if (button) button.disabled = true;
  try {
    await run(data, el);
  } catch (e) {
    if (isAuth) showAuthError(e.message); else notify(e.message, true);
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
  if (el.dataset.topics) {
    const topic = document.getElementById(el.dataset.topics);
    if (topic) { topic.innerHTML = topicOptions(el.value); topic.disabled = !el.value; }
  } else if (el.id === 'pf-school') {
    const major = document.getElementById('pf-major');
    if (major) { major.innerHTML = majorOptions(el.value); major.disabled = !el.value; }
  } else if ('dropzone' in el.dataset) {
    showPicked(el);
  } else if (el.dataset.filePath) {
    pickFile(el.dataset.filePath, el.files?.[0]);
  } else if (el.matches('[data-guide-check]')) {
    local.guideChecks[el.dataset.guideCheck] = el.checked;
    runtime.sync.stateChanged();
  }
});

document.addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return;
  for (const menu of document.querySelectorAll('.account[open],.bell[open]')) menu.removeAttribute('open');
  if (state.modal) closeModal();
});
for (const [on, off] of [['pointerover', 'pointerout'], ['focusin', 'focusout']]) {
  document.addEventListener(on, ev => { const card = ev.target.closest?.('[data-map-node]'); if (card) highlight(card.dataset.mapNode); });
  document.addEventListener(off, ev => { if (ev.target.closest?.('[data-map-node]')) highlight(null); });
}
window.addEventListener('resize', drawEdges);
window.addEventListener('hashchange', () => {
  state.modal = null;
  state.qaExpanded = false;
  state.admin.draft = null;
  state.admin.rejecting = null;
  render(false);
  window.scrollTo(0, 0);
  enterRoute();
});
window.addEventListener('online', () => runtime.sync?.flush().catch(() => {}));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') runtime.sync?.flush().catch(() => {}); });
