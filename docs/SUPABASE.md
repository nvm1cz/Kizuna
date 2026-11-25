# Cài đặt Supabase cho Kizuna

Làm một lần, khoảng 10 phút. Người làm nên là người sẽ quản lý dữ liệu của nhóm.

## 1. Tạo project

1. Vào https://supabase.com/dashboard, đăng nhập rồi chọn **New project**.
2. Đặt tên `kizuna`, chọn vùng **Southeast Asia (Singapore)**.
3. Đặt mật khẩu database và cất ở nơi an toàn. **Không** đưa mật khẩu này vào code hay gửi trong nhóm chat.
4. Chờ project tạo xong.

## 2. Tạo bảng

1. Mở **SQL Editor** → **New query**.
2. Dán toàn bộ nội dung [supabase/schema.sql](../supabase/schema.sql) → **Run**.
3. Nếu Supabase cảnh báo câu lệnh có thể xóa hoặc thay đổi (do có `drop policy`, `drop trigger`), chọn chạy tiếp: file chỉ thay policy và trigger của Kizuna, không xóa dữ liệu.
4. Mở **Table Editor**, phải thấy 7 bảng và bảng `questions` có 5 câu hỏi minh họa.

Chạy lại file này nhiều lần vẫn an toàn.

## 3. Cấu hình đăng nhập

**Authentication → URL Configuration**

| Mục | Giá trị |
|---|---|
| Site URL | `https://kizuna-hust-mvp.vercel.app/` |
| Redirect URLs | `https://kizuna-hust-mvp.vercel.app/` và `http://localhost:3000/` |

**Authentication → Sign In / Providers → Email**

- Bật **Email**. Nếu có mục độ dài mật khẩu tối thiểu, đặt **8**.
- **Confirm email**: chọn một trong hai cách dưới đây.

> **Quan trọng:** email mặc định của Supabase **chỉ gửi được cho thành viên project và tối đa 2 thư mỗi giờ**. Sinh viên thử nghiệm sẽ không nhận được thư.

| | Cách A: thử MVP nhanh | Cách B: dùng thật |
|---|---|---|
| Confirm email | **Tắt** | **Bật** |
| Cần làm thêm | Không | Cấu hình **Custom SMTP** (Resend, Brevo, Gmail...) ở Authentication → Emails |
| Đăng ký | Vào được ngay | Phải mở thư xác nhận |
| Quên mật khẩu | Không gửi được thư cho người ngoài nhóm | Hoạt động |
| Nhược điểm | Có thể đăng ký bằng email của người khác | Phải có dịch vụ gửi thư |

Khi dùng cách A mà có người quên mật khẩu: quản trị viên xử lý ở **Authentication → Users**.

## 4. Nối vào code

1. Bấm nút **Connect** ở đầu trang Supabase, chép **Project URL** và **Publishable key** (`sb_publishable_...`).
2. Điền vào [public/js/config.js](../public/js/config.js):

```js
export const SUPABASE_URL = 'https://ten-project.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_...';
```

| Khóa | Đưa vào `public/js/config.js`? |
|---|---|
| `sb_publishable_...` hoặc `anon` | Được, kể cả commit lên Git |
| `sb_secret_...`, `service_role` | **Tuyệt đối không**, khóa này bỏ qua mọi phân quyền |
| Mật khẩu database | **Tuyệt đối không** |

Kizuna tự từ chối chạy nếu phát hiện khóa bí mật trong `public/js/config.js`.

## 5. Kiểm tra

1. Chạy `npm run dev`, mở http://localhost:3000.
2. Đăng ký tài khoản 1, đánh dấu một Node "Đã thông suốt", đặt một câu hỏi.
3. Mở cửa sổ ẩn danh, đăng ký tài khoản 2: tiến độ phải **trống**, thấy câu hỏi nhưng **không biết ai hỏi**.
4. Đăng nhập tài khoản 1 ở cửa sổ ẩn danh: tiến độ phải **hiện lại**.
5. Chỉ push lên `main` sau khi các bước trên đúng. Nếu push khi `public/js/config.js` còn trống, web sẽ chỉ hiện "Chưa sẵn sàng".

## Quản trị hằng ngày

| Việc | Cách làm |
|---|---|
| Ẩn câu hỏi, phản hồi vi phạm | Table Editor → `questions` / `replies` → `hidden` = `true` |
| Xem báo cáo, góp ý | Table Editor → `reports`, `feedback` |
| Xem Node nhiều người kẹt | SQL bên dưới |
| Khóa, xóa người dùng | Authentication → Users (xóa thì mất tiến độ, câu hỏi vẫn còn nhưng không gắn với ai) |

```sql
select node_id, count(*) as so_nguoi from public.node_progress where status = 'stuck' group by node_id order by 2 desc;
```

Gói miễn phí **tạm dừng project sau 1 tuần không hoạt động**. Trước buổi demo hoặc phỏng vấn, mở Dashboard kiểm tra và bấm khôi phục nếu cần.

## Dữ liệu nằm ở đâu

| Bảng | Nội dung | Ai đọc, ghi được |
|---|---|---|
| `auth.users` | Email, mật khẩu đã băm (Supabase quản lý) | Quản trị viên |
| `node_progress` | Trạng thái từng Node | Chính chủ |
| `study_state` | Flash-check đã mở, checklist | Chính chủ |
| `questions`, `replies`, `empathy` | Hỏi đáp | Qua hàm, không lộ người gửi |
| `reports`, `feedback` | Báo cáo, góp ý | Gửi qua hàm, chỉ quản trị viên đọc |

Môn học, Node, giảng viên và đề thi vẫn nằm trong code.

## Giới hạn cần biết

- Yêu cầu đăng nhập được kiểm tra ở giao diện. Dữ liệu người dùng được Supabase bảo vệ thật, nhưng **nội dung bài học nằm trong file JS công khai**, người biết kỹ thuật vẫn xem được khi chưa đăng nhập.
- Việc khóa Node cũng chỉ ở giao diện.
- Câu hỏi cũ trên Vercel Blob **không tự chuyển sang**. Chúng vẫn còn trong Blob cho tới khi chủ project xóa.
- Nếu một tài khoản mở trên hai máy cùng lúc, máy kia thấy thay đổi sau khi tải lại trang.

Tài liệu gốc: [SMTP](https://supabase.com/docs/guides/auth/auth-smtp) · [API keys](https://supabase.com/docs/guides/api/api-keys) · [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
