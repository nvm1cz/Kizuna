/** Trạng thái ứng dụng: phần lưu trên thiết bị (local) và phần tạm của giao diện (state). */
import {courses, nodes, sampleQuestions, getNode} from './data.js';
import {isUnlocked, isMastered} from './learning-path.js';

const KEY = 'kizuna-mvp-state-v1';

export const local = (() => {
  const base = {progress: {}, saved: [], answers: {}, guideChecks: {}};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {...base, ...raw, device: raw.device || crypto.randomUUID()};
  } catch {
    return {...base, device: crypto.randomUUID()};
  }
})();

export const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(local)); } catch { /* chế độ riêng tư: vẫn dùng được trong phiên này */ }
};

export const state = {
  route: 'home', segments: [],
  search: '', communitySearch: '', communityFilter: 'all',
  modal: null, expanded: new Set(), flashIndex: {}, examTerm: 'mid', openAnswers: new Set(), qaExpanded: false,
  qa: {questions: [...sampleQuestions], replies: [], nodeCounts: {}, myEmpathy: []}, qaError: false, busy: false
};

export const courseIds = new Set(courses.map(c => c.id));
export const nodeIds = new Set(nodes.map(n => n.id));

export const STATUS = {explore: 'Đang khám phá', stuck: 'Cần gỡ rối', clear: 'Đã thông suốt'};
export const getStatus = id => local.progress[id] || null;
export const unlocked = id => isUnlocked(id, local.progress);
export const mastered = id => isMastered(id, local.progress);
export const isSaved = id => local.saved.includes(id);

export const hasEmpathy = (type, id) => state.qa.myEmpathy.includes(`${type}:${id}`);
export const empathyCount = (type, id) => type === 'node'
  ? state.qa.nodeCounts[id] || 0
  : state.qa.questions.find(q => q.id === id)?.empathyCount || 0;

export function exportPayload() {
  const {progress, saved, answers, guideChecks} = local;
  return {version: 1, exportedAt: new Date().toISOString(), progress, saved, answers, guideChecks};
}

export function importPayload(payload) {
  if (payload?.version !== 1 || !payload.progress || typeof payload.progress !== 'object' || !Array.isArray(payload.saved)) {
    throw Error('Định dạng sao lưu không hợp lệ.');
  }
  const pick = (source, keep) => Object.fromEntries(Object.entries(source || {}).filter(keep));
  local.progress = pick(payload.progress, ([id, status]) => nodeIds.has(id) && Object.hasOwn(STATUS, status));
  local.saved = payload.saved.filter(id => nodeIds.has(id));
  local.answers = Object.fromEntries(Object.entries(payload.answers || {})
    .filter(([id, list]) => nodeIds.has(id) && Array.isArray(list))
    .map(([id, list]) => [id, list.filter(i => Number.isInteger(i) && i >= 0 && i < getNode(id).flash.length)]));
  local.guideChecks = pick(payload.guideChecks, ([key, on]) => key.length <= 100 && typeof on === 'boolean');
  persist();
}
