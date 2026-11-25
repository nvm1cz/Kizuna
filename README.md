# Kizuna MVP v1.7 — học từng mắt xích, nắm chắc cả môn

**Website:** https://kizuna-hust-mvp.vercel.app/  
**Repo:** https://github.com/nvm1cz/Kizuna

Responsive MVP cho sinh viên HUST, trọng tâm là môn **Lập trình mạng (IT4062)**. Ba môn còn lại dùng dữ liệu minh họa.

## Chức năng

**Tài khoản:** bắt buộc đăng nhập bằng email và mật khẩu. Tiến độ học đồng bộ giữa các thiết bị qua Supabase. Hỏi đáp vẫn ẩn danh với người dùng khác. Cài đặt: xem [docs/SUPABASE.md](docs/SUPABASE.md).

Mỗi môn có 4 mục:

- **Bản đồ kiến thức:** 4 chặng. Một Node chỉ mở khi **mọi Node tiên quyết** đã được đánh dấu `Đã thông suốt`. Nếu hạ trạng thái Node trước, các Node phía sau tạm khóa, tiến độ đã lưu vẫn còn. Mở thẳng link Node đang khóa sẽ thấy trang giải thích cần học gì trước.
- **Bài tập lớn:** đề mẫu, các bước nối với Node, checklist nộp bài.
- **Giảng viên:** nhóm cung cấp tính cách, điểm danh, bài tập, lưu ý và cơ cấu điểm. Người dùng chỉ xem, không nhập.
- **Ôn thi:** đề giữa kỳ và cuối kỳ các năm trước (dẫn link) cùng đề tự luyện có đáp án do Kizuna biên soạn.

Mỗi Node có 6 mục: tóm tắt, tài liệu chọn lọc, cảnh báo bẫy, Flash-check, hỏi đáp, tự đánh giá. Ngoài ra có trang **Hỏi đáp** ẩn danh và **Trợ giúp và góp ý**.

## Quy ước nội dung

- `content/lecturers.js`: `kind: 'public'` là người thật, **chỉ ghi điều có trong nguồn công khai**, không biết thì để `null`. `kind: 'sample'` là nhân vật hư cấu, giao diện gắn nhãn “Dữ liệu mẫu”; thay dần bằng dữ liệu nhóm thu thập. Tổng `weight` phải bằng 100 hoặc để mảng rỗng.
- `content/exams.js`: `papers` chỉ chứa link đề công khai, không sao chép nội dung. `practice` là đề tự luyện của nhóm.
- Nguồn do nhóm chọn, chưa được HUST hay giảng viên xác nhận.

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
    content/            NỘI DUNG: môn học, Node, giảng viên, đề thi, bài tập lớn
      nodes/            các Node, mỗi môn một file
    views/              HTML từng trang
      course/           4 mục của trang môn học, mỗi mục một file
    app/                router, sự kiện, luồng đăng nhập, học, hỏi đáp
    core/               trạng thái và quy tắc khóa Node
    services/           gọi Supabase và đồng bộ
supabase/schema.sql     bảng, phân quyền, hàm hỏi đáp
tests/                  kiểm thử
scripts/                server xem thử và kiểm tra cú pháp
docs/                   hướng dẫn Supabase, lịch sử phiên bản
```

### Muốn sửa gì thì vào đâu

| Việc | File |
|---|---|
| Sửa hoặc thêm Node | `public/js/content/nodes/<môn>.js` |
| Sửa giảng viên, cách chấm | `public/js/content/lecturers.js` |
| Thêm đề thi | `public/js/content/exams.js` |
| Sửa bài tập lớn | `public/js/content/project-guides.js` |
| Sửa giao diện một trang | `public/js/views/` và `public/css/` |
| Sửa trang đăng nhập | `views/auth.js`, `app/auth-flow.js`, `css/auth.css` |
| Sửa database | `supabase/schema.sql`, rồi chạy lại trên Supabase |

Thứ tự phụ thuộc: `app → views → core → content`. `services` không dùng `views`; `core` và `content` không dùng các lớp phía trên.

## Triển khai Vercel

- Framework: **Other**. `vercel.json` đặt Output Directory là `public`, Root Directory giữ nguyên gốc repo. Không cần biến môi trường; `BLOB_READ_WRITE_TOKEN` không còn dùng.
- Kiểm tra `public/js/config.js` và chạy thử trên máy **trước khi** push lên `main`, nếu không web chỉ hiện "Chưa sẵn sàng".
- Chưa có trang quản trị và chưa kiểm duyệt trước khi hiện; ẩn nội dung bằng Supabase Table Editor.

## Kiểm thử với người học

1. Đăng ký tài khoản, mở bản đồ IT4062, bấm thử một Node đang khóa.
2. Học Node đầu tiên, chọn **Đã thông suốt**, xem các Node vừa mở.
3. Xem mục Giảng viên, rồi làm một câu trong Ôn thi.
4. Đặt một câu hỏi ẩn danh.

<!-- Deployment trigger for v1.6: GitHub integration check -->
