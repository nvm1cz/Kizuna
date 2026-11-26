/** Khởi động ứng dụng. */
import {state} from '../core/store.js';
import {authMessage} from '../services/backend.js';
import {createSync} from '../services/sync.js';
import {onAuth} from './auth-flow.js';
import {drawEdges} from './map-edges.js';
import {startNoticePolling} from './notice-flow.js';
import {notify, render} from './render.js';
import {runtime} from './runtime.js';
import './events.js';

/** Màn hình báo thiếu cấu hình. */
export function showSetup(problem) {
  Object.assign(state, {phase: 'setup', setupProblem: problem});
  render();
}

/** Chạy ứng dụng với một backend (Supabase thật, hoặc bản giả khi kiểm thử). */
export function start(service, {linkError = null, recovery = false} = {}) {
  runtime.backend = service;
  runtime.sync = createSync(service, () => notify('Chưa lưu được lên máy chủ. Hustree sẽ thử lại khi có mạng.', true));
  if (linkError) state.auth.error = authMessage(linkError);
  if (recovery) Object.assign(state, {phase: 'recovery', auth: {...state.auth, mode: 'recovery'}});
  render();
  service.onAuth(onAuth);
  startNoticePolling();
  document.fonts?.ready?.then(drawEdges);
}
