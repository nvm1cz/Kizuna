# Hustree — học từng nhánh, lớn cả cây

**Website:** https://kizuna-hust-mvp.vercel.app/  
**Repo:** https://github.com/nvm1cz/Kizuna

Hustree (HUST + tree) là cây kiến thức cho **sinh viên Đại học Bách khoa Hà Nội, mọi ngành, mọi môn**. Mỗi môn là một cây gồm các Node, học xong Node trước thì Node sau mở ra. Quản trị viên thêm môn ngay trên web, không cần sửa code.

## Chức năng

- **Tài khoản:** đăng ký, đăng nhập bằng email. Lần đầu vào, chọn trường, ngành, năm học để thấy sẵn các môn của mình.
- **Bản đồ kiến thức:** Node chỉ mở khi mọi Node tiên quyết đã “Đã thông suốt”. Tiến độ đồng bộ giữa các thiết bị.
- **Trang môn học:** bản đồ, bài tập lớn, giảng viên và cách chấm, ôn thi.
- **Hỏi đáp ẩn danh:** theo từng Node, có phản hồi và lượt đồng cảm.
- **Đóng góp:** gửi liên kết hoặc PDF/ảnh; được duyệt thì lên Node kèm tên người gửi. Mỗi tài liệu 10 điểm, có danh hiệu (Hạt giống, Mầm, Chồi, Cây, Cổ thụ) và bảng xếp hạng.
- **Thông báo:** người dùng nhận khi có phản hồi hoặc tài liệu được duyệt; quản trị viên nhận khi có câu hỏi, tài liệu hoặc báo cáo mới.
- **Quản trị:** duyệt tài liệu, thêm và sửa môn, Node, giảng viên, bài tập lớn, đề thi; xử lý báo cáo; cấp quyền.

Hai vai trò: **user** và **admin**. Quyền được kiểm tra trong database, không chỉ ở giao diện.

## Quy ước nội dung

- Giảng viên loại “Thông tin thật, có nguồn”: chỉ ghi điều có căn cứ. Loại “Dữ liệu mẫu” là hư cấu, giao diện gắn nhãn rõ.
- Đề các năm trước chỉ dẫn link công khai, không sao chép nội dung.
- Nguồn do sinh viên chọn, chưa được HUST hay giảng viên xác nhận.

## Chạy trên máy

Yêu cầu Node.js 20+, không cần cài dependency. Kết nối Supabase nằm ở `public/js/config.js`, xem [docs/SUPABASE.md](docs/SUPABASE.md).

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run check
```

## Cấu trúc

```text
public/                 toàn bộ web, Vercel chỉ phục vụ thư mục này
  index.html
  css/                  giao diện, mỗi file một phần; responsive.css luôn nạp cuối
  js/
    main.js             điểm khởi động
    config.js           Project URL và khóa công khai của Supabase
    views/              HTML từng trang; course/ là trang môn, admin/ là trang quản trị
    app/                router, sự kiện, các luồng: đăng nhập, học, hỏi đáp, đóng góp, thông báo, quản trị
    core/               trạng thái, nội dung đã tải, quy tắc khóa Node, danh hiệu
    services/           gọi Supabase và đồng bộ
supabase/
  01_schema.sql         tiến độ, hỏi đáp
  02_hustree.sql        vai trò, hồ sơ, nội dung, đóng góp, thông báo, kho tệp
  03_seed.sql           nội dung khởi tạo, tự sinh từ seed/
  04_demo.sql           dữ liệu mẫu xem thử; 05_demo_cleanup.sql để xóa
  seed/                 nguồn sinh ra 03, 04, 05
tests/                  kiểm thử
scripts/                server xem thử, kiểm tra cú pháp, sinh 03_seed.sql
docs/                   hướng dẫn Supabase, lịch sử phiên bản
```

### Muốn sửa gì thì vào đâu

| Việc | Cách làm |
|---|---|
| Thêm, sửa môn, Node, giảng viên, đề thi | Đăng nhập admin → **Quản trị → Nội dung** |
| Đổi ô nhập của trang quản trị | `public/js/views/admin/specs.js` |
| Đổi điểm và danh hiệu | `public/js/core/ranks.js` và hàm `get_me`, `leaderboard` trong `02_hustree.sql` |
| Sửa giao diện một trang | `public/js/views/` và `public/css/` |
| Sửa logo, tên | `public/js/views/brand.js`, `public/favicon.svg` |
| Sửa database | file trong `supabase/`, rồi chạy lại trên Supabase |

Thứ tự phụ thuộc: `app → views → core`. `services` không dùng `views`.

## Triển khai Vercel

- Framework: **Other**. `vercel.json` đặt Output Directory là `public`, Root Directory giữ nguyên gốc repo. Không cần biến môi trường.
- Khi có thay đổi trong `supabase/`, **chạy SQL trên Supabase trước rồi mới push code**.
- Câu hỏi và phản hồi hiện ngay, chưa duyệt trước; admin ẩn được nội dung vi phạm.

## Kiểm thử với người học

1. Đăng ký tài khoản, chọn ngành, mở một môn, bấm thử một Node đang khóa.
2. Học Node đầu tiên, chọn **Đã thông suốt**, xem các Node vừa mở.
3. Xem mục Giảng viên, rồi làm một câu trong Ôn thi.
4. Đặt một câu hỏi ẩn danh, gửi một tài liệu và xem thông báo.
