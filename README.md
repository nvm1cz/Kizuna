# Kizuna MVP v1.5 — học có định hướng, hỏi không ngại ngùng

**Website:** https://kizuna-hust-mvp.vercel.app/  
**Repo:** https://github.com/nvm1cz/Kizuna

Responsive MVP cho sinh viên HUST, tập trung mô phỏng môn **Lập trình mạng (IT4062)**. Website không có chatbot. Các môn còn lại vẫn giữ dữ liệu minh họa.

## Chức năng

- **Bản đồ kiến thức:** 4 chặng, 9 Node minh họa của IT4062, quan hệ kiến thức tiên quyết. Node đánh dấu **Đã thông suốt** có nền xanh ngay trên bản đồ; không có banner gợi ý học tiếp.
- **Mỗi Node có đúng 6 mục:** (1) Tóm tắt khái niệm, (2) Tài liệu nguồn tuyển chọn (một nguồn ưu tiên, nguồn khác mở thêm), (3) Cảnh báo bẫy, (4) Flash-check, (5) Hỏi đáp ẩn danh & “Tôi cũng đang kẹt”, (6) Tự đánh giá `Đang khám phá` / `Cần gỡ rối` / `Đã thông suốt`.
- **Cẩm nang học phần (đóng mặc định):** Bài tập lớn, Review giảng viên & Chấm điểm, Kiểm tra. Không có tab Bài giảng. Có dẫn nguồn cho các ví dụ cơ cấu điểm, kèm cảnh báo khác học kỳ.
- **Review giảng viên:** Người học có thể gửi tên giảng viên, học kỳ, đánh giá 1–5 và nhận xét ẩn danh. Backend lưu vào bộ chờ biên tập; review **không** được tự công khai và **chưa có hệ thống duyệt/publish review**.
- **Hỏi đáp cộng đồng:** câu hỏi, trả lời, đồng cảm và báo cáo nội dung. Dữ liệu cộng đồng được lưu trên Vercel Blob, có API `/api/community`.

Tài liệu và thông tin học phần là **minh họa cho MVP**. Nguồn được nhóm tuyển chọn sẵn, **không có nghĩa được HUST hay giảng viên xác minh**. Các review giảng viên chưa được hiển thị công khai trước kiểm duyệt.

## Chạy trên máy

Yêu cầu Node.js 20+:

```bash
npm run dev
# mở http://localhost:3000
```

`server.mjs` sử dụng dữ liệu JSON trong `.local/community` để lưu nội dung cộng đồng khi phát triển trên máy.

```bash
npm test
npm run check
```

Không cần cài dependency để chạy local server. Khi deploy Vercel, `@vercel/blob` được cài từ `package.json`.

## Cấu trúc

```text
index.html                 khung trang HTML
app.js                     frontend SPA, router, bản đồ, Node, Flash-check, form
styles.css                 giao diện responsive
data.js                    môn học, Node, tài liệu chọn lọc, Flash-check
learning-guides.js         dữ liệu bài tập lớn và hướng dẫn môn học
course-evidence.js         nguồn minh họa cách chấm / kiểm tra
api/community.js           backend Vercel Serverless Function
lib/community.js           nghiệp vụ cộng đồng, review chờ duyệt
lib/local-store.js         adapter lưu dữ liệu JSON khi phát triển
server.mjs                 local development server
tests/                     kiểm thử logic và tích hợp
vercel.json                headers bảo mật
```

## Triển khai Vercel

- Framework: **Other** (`null`), root của repo.
- Đặt `BLOB_READ_WRITE_TOKEN` cho Production/Preview. Không commit `.env` hay token.
- Dùng Git Integration để tự deploy từ `main`, hoặc deploy source trực tiếp vào project hiện tại.
- Nội dung học tập và trạng thái Node của mỗi người được lưu ở browser `localStorage`, không đồng bộ giữa thiết bị.
- Hỏi đáp cộng đồng và review chờ duyệt lưu bằng Blob. **Không có giao diện admin duyệt review**, chưa phù hợp sử dụng đại trà khi không có moderation và anti-spam ở mức production.

## Kiểm thử MVP với người học

1. Mở [bản đồ IT4062](https://kizuna-hust-mvp.vercel.app/#/course/network), chọn một Node.
2. Đọc 6 mục, mở Flash-check rồi gửi câu hỏi ẩn danh nếu chưa hiểu.
3. Chọn **Đã thông suốt**, quay lại bản đồ và kiểm tra thẻ Node đã chuyển màu xanh.
4. Mở cẩm nang để xem Bài tập lớn, Review giảng viên & Chấm điểm, Kiểm tra.
