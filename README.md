# Kizuna MVP v1.6 — học từng mắt xích, nắm chắc cả môn

**Website:** https://kizuna-hust-mvp.vercel.app/  
**Repo:** https://github.com/nvm1cz/Kizuna

Responsive MVP cho sinh viên HUST, trọng tâm là môn **Lập trình mạng (IT4062)**. Ba môn còn lại dùng dữ liệu minh họa.

## Chức năng

Mỗi môn có 4 mục:

- **Bản đồ kiến thức:** 4 chặng. Một Node chỉ mở khi **mọi Node tiên quyết** đã được đánh dấu `Đã thông suốt`. Nếu hạ trạng thái Node trước, các Node phía sau tạm khóa, tiến độ đã lưu vẫn còn. Mở thẳng link Node đang khóa sẽ thấy trang giải thích cần học gì trước.
- **Bài tập lớn:** đề mẫu, các bước nối với Node, checklist nộp bài.
- **Giảng viên & chấm điểm:** nhóm cung cấp tính cách, điểm danh, bài tập, lưu ý và cơ cấu điểm. Người dùng chỉ xem, không nhập.
- **Ôn thi:** đề giữa kỳ và cuối kỳ các năm trước (dẫn link) cùng đề tự luyện có đáp án do Kizuna biên soạn.

Mỗi Node có 6 mục: tóm tắt, tài liệu chọn lọc, cảnh báo bẫy, Flash-check, hỏi đáp, tự đánh giá. Ngoài ra có trang **Hỏi đáp** ẩn danh, trang **Của tôi** (chủ đề đã lưu hoặc đang học dở, sao lưu tiến độ) và **Trợ giúp và góp ý**.

## Quy ước nội dung

- `lecturers.js`: `kind: 'public'` là người thật, **chỉ ghi điều có trong nguồn công khai**, không biết thì để `null`. `kind: 'sample'` là nhân vật hư cấu, giao diện gắn nhãn “Dữ liệu mẫu”; thay dần bằng dữ liệu nhóm thu thập. Tổng `weight` phải bằng 100 hoặc để mảng rỗng.
- `exams.js`: `papers` chỉ chứa link đề công khai, không sao chép nội dung. `practice` là đề tự luyện của nhóm.
- Nguồn do nhóm chọn, chưa được HUST hay giảng viên xác nhận.

## Chạy trên máy

Yêu cầu Node.js 20+, không cần cài dependency.

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run check
```

Khi chạy local, dữ liệu cộng đồng nằm trong `.local/community`.

## Cấu trúc

```text
index.html            khung trang
app.js                router, sự kiện, gọi API
views.js              các hàm dựng HTML
store.js              trạng thái và localStorage
learning-path.js      quy tắc khóa, mở Node
styles.css            giao diện
data.js               môn học, Node, Flash-check
learning-guides.js    bài tập lớn mẫu
lecturers.js          giảng viên và cách chấm điểm
exams.js              đề ôn thi
api/community.js      Vercel Serverless Function
lib/                  nghiệp vụ cộng đồng, lưu trữ local
server.mjs            server phát triển
tests/                kiểm thử
```

Thêm file JS mới ở thư mục gốc thì phải khai báo trong danh sách cho phép của `server.mjs`.

## Triển khai Vercel

- Framework: **Other**, root của repo. Đặt `BLOB_READ_WRITE_TOKEN` cho Production và Preview, không commit token.
- Tiến độ học lưu ở `localStorage`, không đồng bộ giữa thiết bị. Câu hỏi, phản hồi, đồng cảm, báo cáo và góp ý lưu bằng Blob.
- Chưa có đăng nhập, trang quản trị hay kiểm duyệt chủ động, nên chưa phù hợp dùng đại trà.

## Kiểm thử với người học

1. Mở bản đồ IT4062, bấm thử một Node đang khóa.
2. Học Node đầu tiên, chọn **Đã thông suốt**, xem các Node vừa mở.
3. Xem Giảng viên & chấm điểm, rồi làm một câu trong Ôn thi.
4. Đặt một câu hỏi ẩn danh.
