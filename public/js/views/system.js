/** Màn hình hệ thống: đang mở, lỗi tải, thiếu cấu hình, không tìm thấy. */
import {state} from '../core/store.js';
import {empty, link} from './helpers.js';

export const splash = () => '<div class="boot-screen"><span class="brand-mark" aria-hidden="true">絆</span><p>Đang mở Kizuna</p></div>';

export const failedPage = () => `<main class="center-page"><span class="brand-mark" aria-hidden="true">絆</span><h1>Chưa tải được tiến độ</h1><p>Hãy kiểm tra kết nối mạng rồi thử lại.</p>
  <div class="row"><button type="button" class="btn btn-primary" data-action="retry-account">Thử lại</button><button type="button" class="btn btn-ghost" data-action="sign-out">Đăng xuất</button></div></main>`;

const SETUP = {
  missing: 'Kizuna chưa được nối với Supabase. Hãy điền Project URL và khóa công khai vào public/js/config.js theo hướng dẫn trong docs/SUPABASE.md.',
  secret: 'config.js đang chứa khóa bí mật. Hãy thay bằng khóa công khai (sb_publishable_...) và tạo lại khóa bí mật trên Supabase, vì khóa cũ có thể đã lộ.',
  url: 'Project URL trong config.js chưa đúng. URL có dạng https://ten-project.supabase.co',
  library: 'Không tải được thư viện Supabase. Hãy kiểm tra mạng hoặc phần mềm chặn quảng cáo rồi tải lại trang.'
};
export const setupPage = () => `<main class="center-page"><span class="brand-mark" aria-hidden="true">絆</span><h1>Chưa sẵn sàng</h1><p>${SETUP[state.setupProblem]}</p></main>`;

export const notFound = () => empty('compass', 'Không tìm thấy trang này', '', link('home', 'btn btn-primary', 'Về trang môn học'));
