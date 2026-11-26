/** Bảng xếp hạng đóng góp: cột bên phải mọi trang, và tab riêng trong trang Đóng góp. */
import {rankOf} from '../core/ranks.js';
import {state} from '../core/store.js';
import {esc, link} from './helpers.js';
import {ico} from './icons.js';

const PERIODS = [['month', 'Tháng'], ['all', 'Tổng']];
const TOP = 5;

/** Lớp của khung trang: có cột phải, cột thu gọn, hoặc không có cột. */
export const layoutClass = () => onRankingTab() ? 'layout is-single' : state.board.collapsed ? 'layout is-collapsed' : 'layout';

/** Đang mở tab riêng thì không hiện cột bên phải. */
export const onRankingTab = () => state.route === 'contribute' && state.segments[1] === 'ranking';

const row = (r, full) => `<li class="${r.mine ? 'is-me' : ''} ${r.rank <= 3 ? 'is-top' : ''}"><span class="board-rank">${r.rank}</span><span class="board-name"><strong title="${esc(r.name)}">${r.mine && !full ? 'Bạn' : esc(r.name)}${r.mine && full ? ' (bạn)' : ''}</strong>${full ? `<small>${state.board.period === 'all' ? rankOf(r.points) : `${r.count} tài liệu`}</small>` : ''}</span><span class="board-points">${r.points}</span></li>`;

const periods = () => `<div class="segmented" role="group" aria-label="Thời gian">${PERIODS.map(([id, label]) => `<button type="button" data-action="board-period" data-period="${id}" aria-pressed="${id === state.board.period}">${label}</button>`).join('')}</div>`;

function board(limit, full) {
  const {period, list} = state.board;
  if (!list) return '<p class="note">Đang tải</p>';
  if (!list.length) return `<p class="ranking-empty">${ico('trophy', 28)}<span>${period === 'month' ? 'Tháng này chưa có ai lên bảng.' : 'Chưa có ai lên bảng.'}</span></p>`;
  const top = list.slice(0, limit), me = list.slice(limit).find(r => r.mine);
  return `<ol class="board">${top.map(r => row(r, full)).join('')}${me ? `<li class="board-gap" aria-hidden="true">···</li>${row(me, full)}` : ''}</ol>`;
}

export const rankingAside = () => state.board.collapsed
  ? `<aside class="ranking is-collapsed" id="ranking" aria-label="Bảng xếp hạng đóng góp"><button type="button" class="ranking-open" data-action="toggle-ranking" aria-expanded="false" title="Mở bảng xếp hạng">${ico('trophy', 22)}<span>Bảng xếp hạng</span></button></aside>`
  : `<aside class="ranking" id="ranking" aria-label="Bảng xếp hạng đóng góp"><header><h2>${ico('trophy', 20)} Bảng xếp hạng</h2><button type="button" class="icon-btn" data-action="toggle-ranking" aria-expanded="true" aria-label="Thu gọn bảng xếp hạng" title="Thu gọn">${ico('chevron', 20)}</button></header>
  ${periods()}${board(TOP, false)}${link('contribute/ranking', 'text-link', 'Xem tất cả')}</aside>`;

export const rankingTab = () => `<section class="ranking-page" id="ranking">${periods()}${board(Infinity, true)}</section>`;

/** Phần tử #ranking của trang đang mở. */
export const ranking = () => onRankingTab() ? rankingTab() : rankingAside();
