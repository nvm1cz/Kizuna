/**
 * Kết nối Supabase. Lấy hai giá trị ở Supabase Dashboard → nút Connect (xem docs/SUPABASE.md).
 *
 * Chỉ dùng khóa CÔNG KHAI: sb_publishable_... (hoặc anon key kiểu cũ). Khóa này được phép nằm trong
 * trình duyệt và trong Git vì dữ liệu đã được bảo vệ bằng Row Level Security.
 * TUYỆT ĐỐI không dán sb_secret_..., service_role hay mật khẩu database vào đây.
 */
export const SUPABASE_URL = 'https://geifaqzjsyrynmbpveep.supabase.co';
export const SUPABASE_KEY = 'sb_publishable__M94M2TX4XYfm4utKnGvRg_RKsF92lX';
