/** Trạng thái ứng dụng. `local` là dữ liệu học của tài khoản đang đăng nhập, `state` là phần tạm của giao diện. */
import {courses, nodes} from '../content/courses.js';
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

const emptyCommunity = () => ({questions: [], replies: [], nodeCounts: {}, myEmpathy: []});

export const state = {
  // 'boot' | 'setup' | 'out' | 'recovery' | 'loading' | 'failed' | 'in'
  phase: 'boot', setupProblem: null, user: null,
  auth: {mode: 'login', email: '', error: '', notice: ''},
  route: 'home', segments: [],
  search: '', communitySearch: '', communityFilter: 'all',
  modal: null, expanded: new Set(), flashIndex: {}, examTerm: 'mid', openAnswers: new Set(), qaExpanded: false,
  qa: emptyCommunity(), qaError: false, busy: false
};

/** Xóa mọi thứ của người dùng trước khỏi giao diện. */
export function resetView() {
  Object.assign(state, {
    search: '', communitySearch: '', communityFilter: 'all', modal: null, expanded: new Set(), flashIndex: {},
    examTerm: 'mid', openAnswers: new Set(), qaExpanded: false, qa: emptyCommunity(), qaError: false
  });
}

export const courseIds = new Set(courses.map(c => c.id));
export const nodeIds = new Set(nodes.map(n => n.id));

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
  const progress = pick(raw.progress, ([id, status]) => nodeIds.has(id) && Object.hasOwn(STATUS, status));
  if (!Object.keys(progress).length) return null;
  return {
    progress,
    answers: pick(raw.answers, ([id, list]) => nodeIds.has(id) && Array.isArray(list)),
    guideChecks: pick(raw.guideChecks, ([key, on]) => key.length <= 100 && typeof on === 'boolean')
  };
}
export const dropLegacy = () => { try { localStorage.removeItem(LEGACY_KEY); } catch { /* bỏ qua */ } };
