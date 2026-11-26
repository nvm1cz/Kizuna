# Lịch sử phiên bản

Chi tiết từng thay đổi xem bằng `git log`. Tài liệu bàn giao cũ (`MVP_HANDOFF.md`) còn trong Git ở commit `3e7088e`.

## v2.0 (2026-11-25)

- Đổi tên Kizuna thành **Hustree**, logo cây kiến thức.
- Lần đăng nhập đầu chọn trường, ngành, năm học; trang chủ hiện sẵn môn tương ứng.
- Hai vai trò user và admin. Admin quản lý toàn bộ nội dung trên web; môn, Node, giảng viên, đề thi chuyển vào database.
- Tab Đóng góp: gửi liên kết, PDF, ảnh; admin duyệt; điểm, danh hiệu, bảng xếp hạng.
- Thông báo cho người dùng và admin.
- Bảng xếp hạng hiện bên phải mọi trang, và có tab riêng trong Đóng góp.
- Bỏ chữ nhỏ dưới Node khóa, chú thích bản đồ, dòng chân trang.

## v1.7 (2026-11-25)

- Bắt buộc đăng nhập; đăng ký, quên mật khẩu bằng Supabase Auth.
- Tiến độ học và hỏi đáp lưu ở Supabase, có Row Level Security. Bỏ Vercel Blob; dữ liệu Blob cũ không tự chuyển sang.
- Tiến độ cũ trên máy được chuyển vào tài khoản ở lần đăng nhập đầu, nếu tài khoản còn trống.
- Bỏ trang "Của tôi"; đổi tab "Giảng viên & chấm điểm" thành "Giảng viên".
- Sắp xếp lại mã nguồn: web nằm trong `public/`, tách các file lớn.

## v1.6 (2026-11-24)

- Thiết kế lại giao diện, chữ nội dung 16px.
- Node chỉ mở khi mọi Node tiên quyết đã thông suốt.
- Nhóm cung cấp thông tin giảng viên thay cho form review.
- Mục Kiểm tra đổi thành Ôn thi: đề các năm trước và đề tự luyện.

## v1.5 (2026-11-24)

- Bỏ chatbot mô phỏng và gợi ý học tiếp. Node đọc theo 6 mục.
- IT4062 thêm DNS, truyền tệp và HTTP server.

## v1.0 – v1.4 (2026-11-16 đến 2026-11-18)

- Bản đồ kiến thức 4 môn, Flash-check, hỏi đáp ẩn danh, lượt đồng cảm.
- Cẩm nang học phần có dẫn nguồn.
