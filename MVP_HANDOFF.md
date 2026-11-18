## Hotfix 1.2.1 (2026-11-17)
- **Nguyên nhân:** nút “Đặt câu hỏi mới” trên `#/community` được gán `data-action="navigate" data-path="courses"`, do form cũ yêu cầu chọn Node trước.
- **Cách sửa:** nút dùng `data-action="ask"`; khi không có Node, biểu mẫu có dropdown môn học và chủ đề; chọn Node từ màn Hỏi đáp rồi đăng trực tiếp.
- Sau khi gửi, ở lại tab Hỏi đáp, bỏ lọc để hiển thị câu hỏi mới; màn Node vẫn mặc định chọn đúng Node.
- Đã bổ sung `tests/ask-route.test.js`; tổng 9/9 kiểm thử logic thành công.

# Kizuna — MVP Handoff

**Production URL:** https://kizuna-hust-mvp.vercel.app/

**Tech:** HTML + CSS + native JavaScript modules; Node.js HTTP server for local development; Vercel Function + Vercel Blob for anonymous community content. No frontend framework required.

**Phạm vi đã chốt trong file nghiên cứu:**

- Bản đồ các Node kiến thức có liên kết tiên quyết, tóm tắt, tài liệu và cảnh báo bẫy.
- Flash-check 1–2 câu mỗi Node, trả lời theo cơ chế tự kiểm tra không chấm điểm, trạng thái `Đang khám phá / Cần gỡ rối / Đã thông suốt`.
- Hỏi đáp công khai với biệt danh ngẫu nhiên ở từng Node, có thể xem và thêm phản hồi.
- Lượt đồng cảm `Tôi cũng đang kẹt` ở Node và câu hỏi, ưu tiên hiển thị câu hỏi được đồng cảm nhiều.

**Bổ sung:** tìm kiếm và lọc, lưu Node, trạng thái cá nhân, xuất/nhập sao lưu, phản hồi về MVP, báo cáo bài viết, giao diện mobile, API validate đầu vào.

**Seed content:** 4 môn mẫu, 24 Node, 5 câu hỏi minh họa (tất cả có nhãn). Tất cả học liệu mẫu là tài liệu công khai được chọn làm ví dụ, không được quảng bá là tài liệu đã được HUST hoặc giảng viên xác minh. Mã môn `IT4062` được dùng cho Lập trình mạng; các mã còn lại có hậu tố `DEMO`.

**Data & privacy:** localStorage lưu tên hiển thị, trạng thái, flash đã mở, bookmark và ID thiết bị ngẫu nhiên. Blob lưu câu hỏi, phản hồi, đồng cảm và góp ý chung. Q&A không đính kèm tên thật do người dùng nhập, nhưng **chưa đạt mức bảo vệ ẩn danh tuyệt đối**, vì chưa có tài khoản, quản lý phiên, backend chống spam và kiểm duyệt chuyên nghiệp. Không sử dụng dữ liệu cá nhân nhạy cảm khi phỏng vấn thử.

**Verification:** 4 nhóm test logic bằng `npm test` đã pass; `npm run check` cú pháp JavaScript đã pass; local HTTP GET và POST trả kết quả hợp lệ. Vercel xác nhận deployment `READY`; GET `/` và GET `/api/community` trên domain production trả HTTP 200. Khả năng gửi POST ở production cần được người dùng kiểm tra thực tế trong trình duyệt sau khi mở website; không khẳng định đã test e2e trên production.

**Triển khai:** Vercel project `kizuna-hust-mvp` thuộc team `nvm7`. Một public Vercel Blob store `kizuna-hust-community` đã được kết nối và biến `BLOB_READ_WRITE_TOKEN` được tạo trên project; tuyệt đối không đưa token vào client hoặc repo. Deployment ban đầu được upload từ source snapshot, chưa kết nối Git; để duy trì cập nhật liên tục, tạo repo rồi kết nối Git Integration.

**Đưa vào sử dụng rộng rãi cần bổ sung:** xác thực thật (auth), cách bảo vệ ẩn danh mạnh hơn, cơ sở dữ liệu giao dịch và chỉ mục tìm kiếm, server-side rate limiting theo IP/tài khoản, chống bot, kiểm duyệt, phân quyền mentor/admin, workflow xét duyệt tài liệu, theo dõi API errors, sao lưu/phục hồi dữ liệu.


## V1.1 (2026-11-16) — Bổ sung theo phản hồi người dùng

- Bản đồ kiến thức được mở rộng bằng phần **Cẩm nang học phần**: dự án có 5 bước liên kết trực tiếp Node, checklist đầu ra đã lưu trên thiết bị, phần chuẩn bị yêu cầu giảng viên và minh họa các hình thức đánh giá (không gán điểm thi chính thức).
- **Chatbot mô phỏng** (hoạt động local/client): áp dụng rules + keyword retrieval, kho `data.js` và `learning-guides.js`; trả lời có cấu trúc, gợi ý Node/cẩm nang, tự nhận biết giới hạn với fallback. Không dùng LLM, chưa học AI, không gọi dịch vụ AI. Bật từ Node, câu hỏi cộng đồng hoặc nút nổi. Hội thoại lưu cục bộ và có thể xóa.
- Nguồn lưu trữ công khai HUST riêng IT4062 được liên kết trực tiếp, phân biệt tài liệu cũ theo giảng viên/lớp và yêu cầu hiện hành. Những môn còn lại có tên/mã demo, ví dụ BTL và dạng thi đều minh họa.
- Các quy trình chatbot, bản đồ, form hỏi đáp và data Vercel Blob cũ vẫn giữ. Sửa key v1 để bảo toàn trạng thái đã lưu.
- Chỉ tiêu kiểm thử: `npm test` cho topology, guide completeness, bot retrieval/honest fallback, persistence logic và HTML rendering; `npm run check` syntax.
- Chưa có xác thực hay xác minh lời giải bot, bot không thể hiểu câu hỏi ngoài bộ dữ liệu mẫu.

## UI release v1.2 (2026-11-17)
- Feedback: user thinks v1.1 overloads people with information, requests minimal screen / functional focus.
- 4 core features remain intact: map, Flash-check, anonymous Q&A, empathy. Simulated chatbot and course assignment/lecturer/exam guides remain available.
- Homepage: removed stats, secondary feature pitches, and repeated disclaimer blocks; direct course cards + two shortcuts.
- Course: map first, project/lecturer/exam guide accordion defaults closed; open/click tabs to see all existing content.
- Node: first 2 key ideas then immediate bot/anonymous Q&A, Flash-check with single-question pagination, expandable resources/pitfalls, compact status + empathy, expandable prerequisites. On mobile, status precedes community discussion.
- Community: simple CTA and question listing, with search/course filters maintained; omitted duplicate explanation panels.
- Personal: compact counts/list; backup options in expandable advanced section.
- Preserved localStorage key, community API/storage, seeded courses, bot implementation. Old routes supported.
- Current tests: 8/8 pass + browser interaction UI check (Chromium in no-network environment, module-bundled fixture).

## Hotfix v1.2.2 (2026-11-17) — Câu hỏi không bắt buộc nhập nội dung
- Vấn đề: biểu mẫu HTML có `minlength=8/15` và `required` trên tiêu đề, phần mô tả, môn học và chủ đề; người dùng bị chặn ngay tại trình duyệt khi muốn gửi chuỗi ngắn/trống. Backend cũng từ chối những câu hỏi ngắn.
- Đã xóa các ràng buộc bắt buộc cho riêng form `ask-form`; bỏ kiểm tra độ dài tối thiểu phía backend. Giữ `maxlength` để tránh payload quá lớn.
- Không bắt buộc chọn môn/Node. Câu hỏi không phân loại vẫn hiển thị tại trang Hỏi đáp, có thể đồng cảm và trả lời. Nếu title trống, UI hiển thị “Câu hỏi chưa có tiêu đề”.
- Trong form gắn sẵn Node từ trang Node, backend giữ liên kết đó; form từ cộng đồng có thể bỏ trống tất cả.
- Giữ rate limit thô 20 giây theo device ID để giảm spam; các biểu mẫu khác (trả lời, góp ý, báo cáo) giữ quy tắc cũ.
- Test `npm test` pass 10/10; test qua server local POST rỗng và GET đọc lại pass. Chưa thử POST production để tránh tạo bài đăng rác vào kho dữ liệu thật.


### Quyết định v1.2.3 — Chatbot nổi trên toàn ứng dụng
- CTA **Hỏi Bot** là nút nổi cố định ở **mọi route**: home, courses, course, node, community, my, help; không ẩn có điều kiện theo route.
- Mở/đóng drawer giữ nguyên route, không điều hướng; giữ lại lịch sử chat local. Khi mở trên Node, ngữ cảnh gắn Node hiện tại.
- Trên mobile giữ FAB góc dưới bên phải, drawer responsive; không thay đổi dữ liệu hay backend.
- Bổ sung regression test kiểm tra tất cả route, mở/đóng, không đổi hash và cập nhật ngữ cảnh Node.


## Update v1.3 — simplified roadmap (2026-11-17)
- Redesigned the knowledge map into four responsive stage columns (stacked timeline on mobile).
- Preserved all `nodes[].deps` as source-of-truth. Desktop draws only real prerequisite edges, highlights adjacent relations on hover/keyboard focus. Mobile renders textual 'Học sau' prerequisites without clutter.
- Added 'Gợi ý học tiếp' based on nodes not marked clear whose prerequisites are all marked clear; no locking or artificial course progress.
- Added predecessor links on detail page.
- Unchanged core features: Flash-check, anonymous Q&A, community empathy, persistent floating demo bot, collapse-on-demand assignment/assessment guides.
- Regression tests: `npm test` (12 tests including new map validation).


### 2026-11-17 / v1.4 — Sourced course information
- UI cẩm nang vẫn ẩn mặc định, 5 mục: Bài giảng, Bài tập lớn (mẫu), Yêu cầu GV, Chấm điểm, Kiểm tra.
- `course-evidence.js` tập hợp liên kết và nội dung có đối chiếu cho network/web/ML/IoT, có phân biệt lịch sử với hiện hành.
- Thông tin tỷ lệ điểm có nguồn ví dụ IT4062 (50/50 và đề cương cũ 30/70), IT3190 (slide 2025 40/60). Với IT4409 và IT4735 chưa tìm được tỷ trọng lớp hiện hành => không ghi con số giả.
- Mã môn hiển thị IT4409, IT3190, IT4735 thay vì placeholder; dữ liệu Node vẫn minh họa.
- Tham khảo nguồn gốc tại các liên kết HTTPS trong `course-evidence.js`.
