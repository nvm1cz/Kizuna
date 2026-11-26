/** Luồng bảng xếp hạng: tải và vẽ lại riêng cột bên phải, không đụng tới phần người dùng đang gõ. */
import {setCollapsed, state} from '../core/store.js';
import {layoutClass, ranking} from '../views/ranking.js';
import {drawEdges} from './map-edges.js';
import {runtime} from './runtime.js';

function drawRanking() {
  const el = document.getElementById('ranking');
  if (el) el.outerHTML = ranking();
}

export async function loadRanking() {
  const uid = state.user?.id, {period} = state.board;
  try {
    const list = await runtime.backend.leaderboard(period);
    if (state.user?.id !== uid || state.board.period !== period) return;
    const changed = JSON.stringify(list) !== JSON.stringify(state.board.list);
    state.board.list = list;
    if (changed) drawRanking();
  } catch { /* lần sau thử lại */ }
}

export function toggleRanking() {
  setCollapsed(!state.board.collapsed);
  const layout = document.querySelector('.layout');
  if (layout) layout.className = layoutClass();
  drawRanking();
  document.querySelector('[data-action="toggle-ranking"]')?.focus();
  drawEdges();
}

export function setPeriod(period) {
  Object.assign(state.board, {period, list: null});
  drawRanking();
  return loadRanking();
}
