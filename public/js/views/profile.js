/** Chọn trường, ngành, năm học: lần đăng nhập đầu và trang Hồ sơ. */
import {getMajor} from '../core/catalog.js';
import {state} from '../core/store.js';
import {brand, heroArt} from './brand.js';
import {esc, majorOptions, options, schoolOptions, YEARS} from './helpers.js';

function profileForm(submit) {
  const me = state.me || {}, schoolId = getMajor(me.majorId)?.schoolId || '';
  return `<form id="profile-form" class="profile-form">
    <div class="field"><label for="pf-school">Trường, khoa</label><select id="pf-school" name="school" required>${schoolOptions(schoolId)}</select></div>
    <div class="field"><label for="pf-major">Ngành</label><select id="pf-major" name="major" required ${schoolId ? '' : 'disabled'}>${majorOptions(schoolId, me.majorId)}</select></div>
    <div class="field"><label for="pf-year">Năm học</label><select id="pf-year" name="year" required>${options(YEARS, me.studyYear, 'Chọn năm')}</select></div>
    <div class="field"><label for="pf-name">Tên hiển thị</label><input id="pf-name" name="name" required minlength="2" maxlength="40" autocomplete="nickname" value="${esc(me.displayName)}"><small>Hiện ở bảng xếp hạng và tài liệu bạn đóng góp. Hỏi đáp vẫn ẩn danh.</small></div>
    <button type="submit" class="btn btn-primary btn-block">${submit}</button></form>`;
}

export const onboardingPage = () => `<main class="auth"><section class="auth-brand"><p class="brand">${brand}</p><div><h2>Trồng cây của bạn<br>bắt đầu từ đây.</h2>${heroArt}</div></section>
  <section class="auth-side"><div class="auth-form"><h1>Bạn đang học gì?</h1><p class="auth-lead">Hustree sẽ hiện sẵn các môn của ngành và năm bạn chọn.</p>${profileForm('Vào Hustree')}
  <p class="auth-foot"><button type="button" class="text-link" data-action="sign-out">Đăng xuất</button></p></div></section></main>`;

export const profilePage = () => `<div class="narrow"><h1>Hồ sơ học tập</h1><div class="panel">${profileForm('Lưu hồ sơ')}</div></div>`;
