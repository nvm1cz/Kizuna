/** Luồng đăng nhập: vào tài khoản, đăng xuất và xử lý các biểu mẫu đăng nhập. */
import {setCatalog} from '../core/catalog.js';
import {local, state, openAccount, closeAccount, resetView} from '../core/store.js';
import {authMessage} from '../services/backend.js';
import {loadCommunity} from './community-flow.js';
import {loadNotices} from './notice-flow.js';
import {loadRanking} from './ranking-flow.js';
import {notify, render} from './render.js';
import {enterRoute} from './route-flow.js';
import {runtime} from './runtime.js';

let recoveredUser = null;

/** Vào tài khoản: lấy nội dung, hồ sơ và tiến độ từ máy chủ rồi mới mở ứng dụng. */
export async function enter(user) {
  if (state.user && state.user.id !== user.id) leave();
  state.user = user;
  Object.assign(state.auth, {error: '', notice: ''});
  openAccount(user.id);
  state.phase = 'loading';
  render();
  let moved = false, stale = false;
  try {
    const [me, content] = await Promise.all([runtime.backend.me(), runtime.backend.content()]);
    if (state.user?.id !== user.id) return;
    setCatalog(content);
    state.me = me;
  } catch (e) {
    if (state.user?.id !== user.id) return;
    Object.assign(state, {phase: 'failed', failure: e.message});
    return render();
  }
  try {
    moved = await runtime.sync.pull();
  } catch {
    stale = true;
  }
  if (state.user?.id !== user.id) return; // đã đăng xuất trong lúc chờ
  if (stale && !local.synced) {
    Object.assign(state, {phase: 'failed', failure: 'Chưa tải được tiến độ học. Hãy kiểm tra mạng rồi thử lại.'});
    return render();
  }
  const {displayName, majorId, studyYear} = state.me;
  state.phase = displayName && majorId && studyYear ? 'in' : 'onboarding';
  render(false);
  if (moved) notify('Đã chuyển tiến độ trên máy này vào tài khoản của bạn.');
  if (stale) notify('Chưa đồng bộ được. Đang dùng tiến độ lưu trên máy.', true);
  enterRoute();
  loadCommunity(true);
  loadNotices();
  loadRanking();
}

function leave() {
  closeAccount();
  resetView();
  setCatalog();
  state.user = null;
  state.auth.email = '';
}

export function onAuth(event, user) {
  if (user) recoveredUser = user;
  if (event === 'PASSWORD_RECOVERY' && user) {
    state.phase = 'recovery';
    setAuthMode('recovery');
    return;
  }
  if (state.phase === 'recovery' && user) return; // đang đặt mật khẩu mới
  if (!user) {
    if (!state.user && state.phase === 'out') return;
    leave();
    state.phase = 'out';
    return setAuthMode('login', {notice: state.auth.notice, error: state.auth.error});
  }
  if (state.user?.id === user.id) return; // làm mới phiên hoặc quay lại tab
  enter(user);
}

export function setAuthMode(mode, {error = '', notice = ''} = {}) {
  Object.assign(state.auth, {mode, error, notice});
  render(false);
  requestAnimationFrame(() => document.querySelector('.auth-form input:placeholder-shown')?.focus());
}

/** Báo lỗi tại chỗ, không dựng lại trang để giữ nguyên những gì đã gõ. */
export function showAuthError(text) {
  state.auth.error = text;
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = text; el.hidden = !text; }
}

export async function saveProfile(form) {
  const major = String(form.get('major') || ''), year = Number(form.get('year')), name = String(form.get('name') || '').trim();
  await runtime.backend.saveProfile({name, major, year});
  state.me = await runtime.backend.me();
  state.courseScope = 'year';
  if (state.phase !== 'onboarding') {
    location.hash = '#/home';
    return notify('Đã lưu hồ sơ.');
  }
  state.phase = 'in';
  render(false);
}

export async function signOut() {
  let saved = true;
  try { await runtime.sync.flush(); } catch { saved = false; }
  if (!saved && !window.confirm('Một số thay đổi chưa lưu lên máy chủ. Vẫn đăng xuất? Thay đổi sẽ được gửi khi bạn đăng nhập lại trên máy này.')) return;
  try {
    await runtime.backend.signOut();
  } catch (e) {
    notify(e.message, true);
  }
}

const newPassword = form => {
  const password = String(form.get('password') || '');
  if (password.length < 8) throw Error('Mật khẩu cần ít nhất 8 ký tự.');
  if (password !== form.get('confirm')) throw Error('Hai mật khẩu chưa giống nhau.');
  return password;
};
const formEmail = form => state.auth.email = String(form.get('email') || '').trim().toLowerCase();

export const authSubmits = {
  login: async form => {
    try {
      await runtime.backend.signIn(formEmail(form), String(form.get('password') || ''));
    } catch (e) {
      if (e.code === 'email_not_confirmed') return setAuthMode('confirm', {error: e.message});
      throw e;
    }
  },
  signup: async form => {
    const result = await runtime.backend.signUp(formEmail(form), newPassword(form));
    if (result === 'confirm') setAuthMode('confirm');
    if (result === 'exists') setAuthMode('login', {error: authMessage('user_already_exists')});
  },
  forgot: async form => {
    await runtime.backend.sendReset(formEmail(form));
    setAuthMode('login', {notice: 'Nếu email này có tài khoản, thư đặt lại mật khẩu sẽ tới trong ít phút.'});
  },
  confirm: async () => {
    await runtime.backend.resendConfirm(state.auth.email);
    setAuthMode('confirm', {notice: 'Đã gửi lại thư xác nhận.'});
  },
  recovery: async form => {
    await runtime.backend.setPassword(newPassword(form));
    state.phase = 'boot';
    state.auth.mode = 'login';
    enter(recoveredUser);
  }
};
