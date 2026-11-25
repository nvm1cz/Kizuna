/** Đăng nhập, đăng ký, quên mật khẩu. */
import {state} from '../core/store.js';
import {esc} from './helpers.js';
import {heroArt} from './hero-art.js';
import {brand} from './shell.js';

const emailField = () => `<div class="field"><label for="auth-email">Email</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder=" " value="${esc(state.auth.email)}"></div>`;
const passwordField = (id, name, label, complete, hint = '') => `<div class="field"><label for="${id}">${label}</label><div class="password"><input id="${id}" name="${name}" type="password" autocomplete="${complete}" required ${complete === 'new-password' ? 'minlength="8"' : ''} maxlength="72" placeholder=" "><button type="button" data-action="show-password" data-target="${id}" aria-label="Hiện hoặc ẩn mật khẩu" aria-pressed="false">Hiện</button></div>${hint ? `<small>${hint}</small>` : ''}</div>`;
const modeButton = (mode, label, cls = 'text-link') => `<button type="button" class="${cls}" data-action="auth-mode" data-mode="${mode}">${label}</button>`;

const AUTH = {
  login: () => ({title: 'Đăng nhập', submit: 'Đăng nhập',
    fields: emailField() + passwordField('auth-password', 'password', 'Mật khẩu', 'current-password') + `<p class="auth-forgot">${modeButton('forgot', 'Quên mật khẩu?')}</p>`,
    foot: `Chưa có tài khoản? ${modeButton('signup', 'Đăng ký')}`}),
  signup: () => ({title: 'Tạo tài khoản', submit: 'Đăng ký',
    fields: emailField() + passwordField('auth-password', 'password', 'Mật khẩu', 'new-password', 'Ít nhất 8 ký tự.') + passwordField('auth-confirm', 'confirm', 'Nhập lại mật khẩu', 'new-password')
      + '<p class="auth-note">Email chỉ dùng để đăng nhập. Người dùng khác không nhìn thấy email của bạn.</p>',
    foot: `Đã có tài khoản? ${modeButton('login', 'Đăng nhập')}`}),
  forgot: () => ({title: 'Quên mật khẩu', lead: 'Nhập email đã đăng ký, Kizuna sẽ gửi liên kết đặt lại mật khẩu.', submit: 'Gửi liên kết', fields: emailField(), foot: modeButton('login', 'Quay lại đăng nhập')}),
  confirm: () => ({title: 'Xác nhận email', lead: `Mở liên kết trong thư đã gửi tới <strong>${esc(state.auth.email)}</strong>. Nếu chưa thấy, hãy xem cả mục thư rác.`, submit: 'Gửi lại thư', fields: '', foot: modeButton('login', 'Quay lại đăng nhập')}),
  recovery: () => ({title: 'Đặt mật khẩu mới', submit: 'Lưu mật khẩu',
    fields: passwordField('auth-password', 'password', 'Mật khẩu mới', 'new-password', 'Ít nhất 8 ký tự.') + passwordField('auth-confirm', 'confirm', 'Nhập lại mật khẩu', 'new-password'), foot: ''})
};

export function authPage() {
  const {error, notice} = state.auth, view = (AUTH[state.auth.mode] || AUTH.login)();
  return `<main class="auth"><section class="auth-brand"><p class="brand">${brand}</p><div><h2>Học từng mắt xích,<br>nắm chắc cả môn.</h2>${heroArt}</div></section>
  <section class="auth-side"><form id="auth-form" class="auth-form"><h1>${view.title}</h1>${view.lead ? `<p class="auth-lead">${view.lead}</p>` : ''}
    ${notice ? `<p class="auth-notice" role="status">${esc(notice)}</p>` : ''}<p class="auth-error" id="auth-error" role="alert" ${error ? '' : 'hidden'}>${esc(error)}</p>
    ${view.fields}<button type="submit" class="btn btn-primary btn-block">${view.submit}</button>${view.foot ? `<p class="auth-foot">${view.foot}</p>` : ''}</form></section></main>`;
}
