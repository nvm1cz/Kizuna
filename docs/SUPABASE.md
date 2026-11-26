# Cài đặt Supabase cho Hustree

## 1. Tạo project (đã làm thì bỏ qua)

1. https://supabase.com/dashboard → **New project**, vùng **Southeast Asia (Singapore)**, bật **Enable Data API**.
2. Cất mật khẩu database ở nơi an toàn, **không** đưa vào code hay nhóm chat.

## 2. Chạy SQL

Mở **SQL Editor → New query**, chạy **lần lượt từng file**:

| Thứ tự | File | Ghi chú |
|---|---|---|
| 1 | [01_schema.sql](../supabase/01_schema.sql) | Project đã chạy `schema.sql` của v1.7 thì bỏ qua |
| 2 | [02_hustree.sql](../supabase/02_hustree.sql) | Chạy lại vẫn an toàn |
| 3 | [03_seed.sql](../supabase/03_seed.sql) | **Chỉ chạy một lần**: 10 trường/khoa, 68 ngành, 4 môn mẫu |
| Tùy chọn | [04_demo.sql](../supabase/04_demo.sql) | Dữ liệu mẫu để xem thử; xóa bằng [05_demo_cleanup.sql](../supabase/05_demo_cleanup.sql) |

Nếu Supabase cảnh báo về `drop policy`, `drop trigger` hay `drop`..., chọn chạy tiếp: các lệnh này chỉ thay policy và trigger của Hustree, không xóa dữ liệu.

Kiểm tra: **Table Editor** có 19 bảng, `majors` 68 dòng; **Storage** có bucket `contributions` ở chế độ private.

## 3. Tạo admin đầu tiên

1. Đăng ký tài khoản trên web như bình thường.
2. Vào SQL Editor, đổi email rồi chạy:

```sql
insert into public.profiles (user_id, role)
select id, 'admin' from auth.users where email = 'email-cua-ban@example.com'
on conflict (user_id) do update set role = 'admin';
```

3. Tải lại web, thanh trên cùng có mục **Quản trị**. Các admin sau cấp ở **Quản trị → Thành viên**.

## 4. Cấu hình đăng nhập

**Authentication → URL Configuration**: Site URL là `https://kizuna-hust-mvp.vercel.app/`; Redirect URLs gồm địa chỉ đó và `http://localhost:3000/`.

**Authentication → Sign In / Providers**: bật **Allow new users to sign up** và **Email**.

> Email mặc định của Supabase **chỉ gửi được cho thành viên project, tối đa 2 thư mỗi giờ**.

| | Thử MVP nhanh | Dùng thật |
|---|---|---|
| Confirm email | **Tắt** | **Bật**, kèm Custom SMTP |
| Quên mật khẩu | Không gửi được cho người ngoài nhóm | Hoạt động |

## 5. Nối vào code

Nút **Connect** → chép **Project URL** và **Publishable key** vào [public/js/config.js](../public/js/config.js). Không bao giờ dùng `sb_secret_...`, `service_role` hay mật khẩu database; app tự từ chối chạy nếu phát hiện khóa bí mật.

## Quản trị hằng ngày

| Việc | Ở đâu |
|---|---|
| Duyệt tài liệu, sửa nội dung, ẩn câu hỏi, cấp quyền | Trang **Quản trị** trên web |
| Xem góp ý | Table Editor → `feedback` |
| Khóa, xóa người dùng | Authentication → Users |
| Dung lượng tệp | Storage → `contributions` |

Node nhiều người kẹt:

```sql
select node_id, count(*) as so_nguoi from public.node_progress where status = 'stuck' group by node_id order by 2 desc;
```

Gói miễn phí **tạm dừng project sau 1 tuần không hoạt động**. Trước buổi demo, mở Dashboard kiểm tra.

## Bảo mật

- Mọi bảng bật RLS. Chỉ `node_progress` và `study_state` được gọi trực tiếp, mỗi người thấy dòng của mình. Phần còn lại đi qua hàm; hàm `admin_*` tự kiểm tra vai trò. **Không thêm policy cho các bảng khác.**
- Advisors có thể nhắc “RLS enabled no policy” hoặc “security definer”: đó là chủ ý.
- Nội dung học chỉ tải về sau khi đăng nhập. Việc khóa Node chỉ ở giao diện.
- Tệp đóng góp nằm trong kho riêng tư: chỉ người gửi, admin, và mọi người (sau khi được duyệt) xem được, qua đường dẫn hết hạn sau 10 phút. Chỉ nhận PDF, PNG, JPG tối đa 10 MB.

## Giới hạn

- Thông báo cập nhật mỗi 45 giây và khi quay lại tab.
- Việc xếp 68 ngành vào trường/khoa, và môn vào năm học, là dữ liệu tạm do nhóm nhập; admin cần kiểm tra theo khung chương trình thật.
- Từ chối tài liệu không tự xóa tệp trong Storage.
