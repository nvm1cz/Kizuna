/** Luồng hỏi đáp: tải dữ liệu, đồng cảm và gửi biểu mẫu. */
import {getNode} from '../content/courses.js';
import {state, nodeIds, hasEmpathy} from '../core/store.js';
import {closeModal, notify, render} from './render.js';
import {runtime} from './runtime.js';

export async function loadCommunity(silent = false) {
  const uid = state.user?.id;
  try {
    const qa = await runtime.backend.community();
    if (state.user?.id !== uid) return;
    state.qa = {...qa, questions: qa.questions.filter(q => !q.nodeId || nodeIds.has(q.nodeId))};
    state.qaError = false;
  } catch {
    state.qaError = true;
  }
  render();
  if (state.qaError && !silent) notify('Chưa kết nối được cộng đồng.', true);
}

export async function empathize(el) {
  const {type, id} = el.dataset;
  if (state.busy || hasEmpathy(type, id)) return;
  if (state.qaError) return notify('Chưa kết nối được để ghi nhận.', true);
  state.busy = true;
  el.disabled = true;
  try {
    await runtime.backend.empathize(type, id);
    await loadCommunity(true);
  } catch (e) {
    el.disabled = false;
    notify(e.message, true);
  } finally {
    state.busy = false;
  }
}

export const communitySubmits = {
  'ask-form': async form => {
    const nodeId = state.modal.nodeId || String(form.get('nodeId') || '');
    const courseId = getNode(nodeId)?.courseId || String(form.get('courseId') || '');
    await runtime.backend.ask({nodeId, courseId, title: String(form.get('title') || ''), body: String(form.get('body') || '')});
    state.modal = null;
    if (state.route === 'community') { state.communityFilter = 'all'; state.communitySearch = ''; }
    await loadCommunity(true);
    notify('Đã đăng câu hỏi.');
  },
  'reply-form': async form => {
    const {questionId} = state.modal;
    await runtime.backend.reply(questionId, String(form.get('body') || ''));
    state.expanded.add(questionId);
    state.modal = null;
    await loadCommunity(true);
    notify('Đã đăng phản hồi.');
  },
  'report-form': async form => {
    await runtime.backend.report(state.modal.questionId, String(form.get('reason') || ''));
    closeModal();
    notify('Đã gửi báo cáo.');
  },
  'feedback-form': async (form, el) => {
    await runtime.backend.feedback(form.get('rating'), String(form.get('text') || ''));
    el.reset();
    notify('Cảm ơn bạn đã góp ý.');
  }
};
