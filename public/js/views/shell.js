/** Khung trang: thanh trên cùng, thông báo, menu tài khoản. */
import {isAdmin, state} from '../core/store.js';
import {rankOf} from '../core/ranks.js';
import {brand} from './brand.js';
import {esc, link, timeAgo} from './helpers.js';
import {ico} from './icons.js';
import {modal} from './modal.js';
import {layoutClass, onRankingTab, rankingAside} from './ranking.js';

const NAV = [['home', 'compass', 'Môn học'], ['community', 'message', 'Hỏi đáp'], ['contribute', 'gift', 'Đóng góp']];
const activeNav = () => ['home', 'courses', 'my', 'course', 'node'].includes(state.route) ? 'home' : state.route;

const NOTICE_ICON = {reply: 'message', question: 'help', contribution: 'gift', review: 'check', report: 'flag'};

export function bell(open = false) {
  const {unread, items} = state.notices;
  return `<details class="bell" id="bell" ${open ? 'open' : ''}><summary aria-label="Thông báo${unread ? `, ${unread} chưa đọc` : ''}">${ico('bell', 22)}${unread ? `<span class="badge">${unread > 9 ? '9+' : unread}</span>` : ''}</summary>
    <div class="menu notice-menu"><div class="notice-head"><strong>Thông báo</strong>${unread ? '<button type="button" class="text-link" data-action="read-all">Đánh dấu đã đọc</button>' : ''}</div>
    ${items.length ? `<ul>${items.map(n => `<li><button type="button" class="notice ${n.read ? '' : 'is-new'}" data-action="open-notice" data-id="${esc(n.id)}" data-link="${esc(n.link)}"><span class="notice-icon">${ico(NOTICE_ICON[n.kind] || 'bell', 18)}</span><span><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span><small>${timeAgo(n.createdAt)}</small></span></button></li>`).join('')}</ul>` : '<p class="notice-empty">Chưa có thông báo nào.</p>'}</div></details>`;
}

function accountMenu() {
  const {email = ''} = state.user || {}, me = state.me || {}, name = me.displayName || email;
  return `<details class="account"><summary aria-label="Tài khoản"><span class="account-dot" aria-hidden="true">${esc(name.slice(0, 1).toUpperCase() || '?')}</span></summary>
    <div class="menu account-menu"><p><strong>${esc(name)}</strong>${isAdmin() ? '<span class="tag">Quản trị viên</span>' : `<span class="tag tag-ok">${rankOf(me.points || 0)}</span>`}<span>${esc(email)}</span></p>
    ${link('profile', 'menu-item', `${ico('user', 18)} Hồ sơ học tập`)}${link('help', 'menu-item', `${ico('help', 18)} Trợ giúp và góp ý`)}
    <button type="button" class="menu-item" data-action="sign-out">${ico('logout', 18)} Đăng xuất</button></div></details>`;
}

export function shell(body) {
  const nav = isAdmin() ? [...NAV, ['admin', 'settings', 'Quản trị']] : NAV;
  const items = nav.map(([route, icon, label]) =>
    link(route, 'nav-link', `${ico(icon, 20)}<span>${label}</span>`, activeNav() === route ? 'aria-current="page"' : '')).join('');
  return `<a class="skip-link" href="#main-content" data-action="skip">Tới nội dung</a>
  <header class="topbar"><div class="topbar-inner">
    ${link('home', 'brand', brand, 'aria-label="Hustree, về trang môn học"')}
    <nav class="nav" aria-label="Điều hướng chính">${items}</nav><div class="topbar-tools">${bell()}${accountMenu()}</div>
  </div></header>
  <div class="${layoutClass()}"><main class="content" id="main-content" tabindex="-1">${body}</main>${onRankingTab() ? '' : rankingAside()}</div>${modal()}`;
}
