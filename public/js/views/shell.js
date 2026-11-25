/** Khung trang: thanh trên cùng, menu tài khoản, chân trang. */
import {state} from '../core/store.js';
import {esc, link} from './helpers.js';
import {ico} from './icons.js';
import {modal} from './modal.js';

const NAV = [['home', 'compass', 'Môn học'], ['community', 'message', 'Hỏi đáp']];
const activeNav = () => ['home', 'courses', 'my', 'course', 'node'].includes(state.route) ? 'home' : state.route;

export const brand = '<span class="brand-mark" aria-hidden="true">絆</span><span>kizuna</span>';

function accountMenu() {
  const email = state.user?.email || '';
  return `<details class="account"><summary aria-label="Tài khoản"><span class="account-dot" aria-hidden="true">${esc(email.slice(0, 1).toUpperCase() || '?')}</span></summary>
    <div class="account-menu"><p>${esc(email)}</p><button type="button" data-action="sign-out">${ico('logout', 18)} Đăng xuất</button></div></details>`;
}

export function shell(body) {
  const items = NAV.map(([route, icon, label]) =>
    link(route, 'nav-link', `${ico(icon, 20)}<span>${label}</span>`, activeNav() === route ? 'aria-current="page"' : '')).join('');
  return `<a class="skip-link" href="#main-content" data-action="skip">Tới nội dung</a>
  <header class="topbar"><div class="topbar-inner">
    ${link('home', 'brand', brand, 'aria-label="Kizuna, về trang môn học"')}
    <nav class="nav" aria-label="Điều hướng chính">${items}</nav>${accountMenu()}
  </div></header>
  <main class="content" id="main-content" tabindex="-1">${body}</main>
  <footer class="footer"><p>Bản thử nghiệm của sinh viên HUST. Nội dung mang tính tham khảo.</p>${link('help', 'footer-link', 'Trợ giúp và góp ý')}</footer>${modal()}`;
}
