/** Trạng thái ứng dụng. `local` là dữ liệu học của tài khoản đang đăng nhập, `state` là phần tạm của giao diện. */
import {getNode} from './catalog.js';
import {isUnlocked, isMastered} from './learning-path.js';

/** Tiến độ khi chưa có tài khoản (bản v1.6 trở về trước). */
const LEGACY_KEY = 'kizuna-mvp-state-v1';
const cacheKey = uid => `kizuna-cache-v2:${uid}`;

const blank = () => ({uid: null, progress: {}, answers: {}, guideChecks: {}, dirtyNodes: [], dirtyState: false, synced: false});
export const local = blank();

const read = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};

/** Nạp bản lưu tạm trên máy của đúng tài khoản này. */
export function openAccount(uid) {
  Object.assign(local, blank(), read(cacheKey(uid)) || {}, {uid});
}

/** Rời tài khoản. Chỉ xóa bản lưu tạm khi mọi thay đổi đã lên máy chủ. */
export function closeAccount() {
  if (local.uid && !local.dirtyNodes.length && !local.dirtyState) {
    try { localStorage.removeItem(cacheKey(local.uid)); } catch { /* bỏ qua */ }
  }
  Object.assign(local, blank());
}

export function persist() {
  if (!local.uid) return;
  const {uid, ...rest} = local;
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(rest)); } catch { /* chế độ riêng tư */ }
}

const emptyContribute = () => ({mine: null});
const COLLAPSE_KEY = 'hustree-ranking-collapsed';
const emptyBoard = () => ({period: 'month', list: null, collapsed: read(COLLAPSE_KEY) === true});

/** Nhớ trên máy này người dùng đã thu gọn bảng xếp hạng hay chưa. */
export function setCollapsed(collapsed) {
  state.board.collapsed = collapsed;
  try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)); } catch { /* chế độ riêng tư */ }
}
const emptyAdmin = () => ({pending: null, reports: null, users: null, rejecting: null, draft: null});
const emptyNotices = () => ({unread: 0, items: []});
const emptyCommunity = () => ({questions: [], replies: [], nodeCounts: {}, myEmpathy: []});

export const state = {
  // 'boot' | 'setup' | 'out' | 'recovery' | 'loading' | 'failed' | 'onboarding' | 'in'
  phase: 'boot', setupProblem: null, failure: '', user: null, me: null,
  auth: {mode: 'login', email: '', error: '', notice: ''},
  route: 'home', segments: [],
  search: '', communitySearch: '', communityFilter: 'all',
  modal: null, expanded: new Set(), flashIndex: {}, examTerm: 'mid', openAnswers: new Set(), qaExpanded: false,
  courseScope: 'year', focusQuestion: null,
  contribute: emptyContribute(), board: emptyBoard(), admin: emptyAdmin(), notices: emptyNotices(),
  qa: emptyCommunity(), qaError: false, busy: false
};

export const isAdmin = () => state.me?.role === 'admin';

/** Xóa mọi thứ của người dùng trước khỏi giao diện. */
export function resetView() {
  Object.assign(state, {
    search: '', communitySearch: '', communityFilter: 'all', modal: null, expanded: new Set(), flashIndex: {},
    examTerm: 'mid', openAnswers: new Set(), qaExpanded: false, qa: emptyCommunity(), qaError: false,
    me: null, courseScope: 'year', focusQuestion: null, contribute: emptyContribute(), board: emptyBoard(), admin: emptyAdmin(), notices: emptyNotices()
  });
}

export const STATUS = {explore: 'Đang khám phá', stuck: 'Cần gỡ rối', clear: 'Đã thông suốt'};
export const getStatus = id => local.progress[id] || null;
export const unlocked = id => isUnlocked(id, local.progress);
export const mastered = id => isMastered(id, local.progress);

export const hasEmpathy = (type, id) => state.qa.myEmpathy.includes(`${type}:${id}`);
export const empathyCount = (type, id) => type === 'node'
  ? state.qa.nodeCounts[id] || 0
  : state.qa.questions.find(q => q.id === id)?.empathyCount || 0;

/** Tiến độ cũ trên máy này, đã lọc bỏ dữ liệu không hợp lệ. Null nếu không có gì để chuyển. */
export function legacyStudy() {
  const raw = read(LEGACY_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const pick = (source, keep) => Object.fromEntries(Object.entries(source || {}).filter(keep));
  const progress = pick(raw.progress, ([id, status]) => getNode(id) && Object.hasOwn(STATUS, status));
  if (!Object.keys(progress).length) return null;
  return {
    progress,
    answers: pick(raw.answers, ([id, list]) => getNode(id) && Array.isArray(list)),
    guideChecks: pick(raw.guideChecks, ([key, on]) => key.length <= 100 && typeof on === 'boolean')
  };
}
export const dropLegacy = () => { try { localStorage.removeItem(LEGACY_KEY); } catch { /* bỏ qua */ } };
