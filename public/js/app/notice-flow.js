/** Luồng thông báo: tải định kỳ, đánh dấu đã đọc, mở nội dung liên quan. */
import {state} from '../core/store.js';
import {bell} from '../views/shell.js';
import {loadCommunity} from './community-flow.js';
import {loadRanking} from './ranking-flow.js';
import {notify} from './render.js';
import {runtime} from './runtime.js';

const EVERY = 45000;

/** Chỉ vẽ lại chuông, không đụng tới phần người dùng đang gõ. */
function drawBell() {
  const el = document.getElementById('bell');
  if (el) el.outerHTML = bell(el.open);
}

export async function loadNotices() {
  const uid = state.user?.id;
  try {
    const next = await runtime.backend.notifications();
    if (state.user?.id !== uid) return;
    const changed = JSON.stringify(next) !== JSON.stringify(state.notices);
    state.notices = next;
    if (changed) drawBell();
  } catch { /* lần sau thử lại */ }
}

export function startNoticePolling() {
  const tick = () => { if (state.phase === 'in' && document.visibilityState !== 'hidden') { loadNotices(); loadRanking(); } };
  setInterval(tick, EVERY)?.unref?.();
  window.addEventListener('focus', tick);
}

const markRead = match => {
  for (const n of state.notices.items) if (match(n)) n.read = true;
  state.notices.unread = match === all ? 0 : Math.max(0, state.notices.unread - 1);
  drawBell();
};
const all = () => true;

export async function readAll() {
  markRead(all);
  try { await runtime.backend.readNotifications(); } catch (e) { notify(e.message, true); }
}

export async function openNotice(id, target) {
  const item = state.notices.items.find(n => String(n.id) === String(id));
  if (item && !item.read) {
    markRead(n => n === item);
    runtime.backend.readNotifications([item.id]).catch(() => {});
  }
  document.getElementById('bell')?.removeAttribute('open');
  const hash = `#/${target || 'home'}`;
  if (location.hash === hash) window.dispatchEvent(new Event('hashchange'));
  else location.hash = hash;
  if (target?.startsWith('community')) await loadCommunity(true);
}
