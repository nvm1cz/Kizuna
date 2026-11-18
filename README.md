# Kizuna — MVP v1.4

**Website:** https://kizuna-hust-mvp.vercel.app/  
**Mã nguồn:** https://github.com/nvm1cz/Kizuna

MVP website responsive hỗ trợ sinh viên HUST: bản đồ kiến thức có quan hệ tiên quyết, Flash-check, hỏi đáp ẩn danh với tính năng “Tôi cũng đang kẹt”, chatbot mô phỏng và cẩm nang học phần.

## Chạy thử

Yêu cầu **Node.js 20+**. Clone repo và chạy:

```bash
git clone https://github.com/nvm1cz/Kizuna.git
cd Kizuna
npm run dev
```

Mở http://localhost:3000. Chạy `npm test` và `npm run check` để kiểm tra.

Lưu ý: dữ liệu học phần chủ yếu là minh họa; chatbot chạy theo quy tắc, không dùng AI API. Dữ liệu hỏi đáp khi chạy trên máy được lưu tại `.local/`; khi triển khai Vercel cần thiết lập **BLOB_READ_WRITE_TOKEN** trong Environment Variables và tuyệt đối không commit token này vào GitHub.

---

# Kizuna MVP — Học có định hướng, hỏi không ngại ngùng

Website responsive phục vụ thử nghiệm giải pháp với sinh viên HUST. Phạm vi bám theo workbook `MVP資料_水1_きずな.xlsx`, đặc biệt các sheet `ソリューションインタビュー準備` và `ソリューションインタビューサマリ`.

## 4 tính năng đã chọn trong workbook (giữ nguyên)

1. **Node kiến thức và nguồn tham khảo:** 4 môn minh họa, tổng cộng 24 Node, phân giai đoạn, thể hiện quan hệ tiên quyết, tóm tắt, điểm dễ nhầm và nguồn công khai.
2. **Flash-check + ba trạng thái:** câu hỏi tự trả lời/xem gợi ý, `Đang khám phá`, `Cần gỡ rối`, `Đã thông suốt`; **không tính điểm/không hiện phần trăm tiến độ**. Trạng thái cá nhân được lưu ở trình duyệt.
3. **Hỏi đáp ẩn danh theo Node:** câu hỏi, phản hồi, biệt danh ngẫu nhiên. Nội dung công khai, không hiển thị tên thật.
4. **Tôi cũng đang kẹt:** mỗi thiết bị được một lượt theo Node/câu hỏi, câu hỏi nhiều đồng cảm được ưu tiên trong danh sách.

Bổ sung: tìm kiếm và lọc môn học/câu hỏi, lưu Node, bản hành trình cá nhân, checklist BTL, xuất/nhập sao lưu, gửi góp ý phỏng vấn, báo cáo nội dung, giao diện mobile.

> **Cần biết:** các Node, mã môn ngoài IT4062 và câu hỏi có nhãn minh họa chỉ là **dữ liệu mẫu**. Các liên kết công khai không được HUST xác minh. Chưa có đăng nhập, xác minh mentor hoặc đồng bộ tiến trình giữa nhiều thiết bị. Hỏi đáp công khai chưa có hệ thống kiểm duyệt chuyên nghiệp. Không nên công khai cho lượng lớn người dùng trước khi bổ sung xác thực, rate limit và moderation.


## Cập nhật v1.1 — Cẩm nang học phần & Kizuna Bot

**Cẩm nang học phần**: 4 môn có 3 tab tương tác nằm ngay dưới bản đồ: (1) Cách làm bài tập lớn — 5 bước thực hiện, kết quả dự kiến và link đến Node liên quan; checklist nộp bài lưu trên trình duyệt, (2) Yêu cầu giảng viên — câu hỏi cần xác nhận và tiêu chí chuẩn bị để bảo vệ, (3) Cấu trúc thi & đánh giá — mô phỏng dạng kiểm tra/lab/bảo vệ/cuối kỳ, không bịa tỷ trọng, điểm hay lịch học. Tất cả đều ghi rõ **MINH HỌA**, không phải yêu cầu giảng viên đang phụ trách.

Riêng **IT4062** đính kèm nguồn lưu trữ công khai HUST: [trang học phần IT4062](https://users.soict.hust.edu.vn/tungbt/it4062/) nêu 50% bài tập + 50% mini project, trong khi [một đề cương IT4062 khác](https://users.soict.hust.edu.vn/hoangph/courses/IT4062/it4062_syllabus.pdf) nêu 30% quá trình + 70% mini project. **Đây là nguồn lịch sử thuộc các tài liệu/lớp khác nhau; KHÔNG suy ra cấu trúc lớp hiện tại.**

**Kizuna Bot (mô phỏng)**: mở từ nút nổi ở góc dưới, nút "Hỏi Kizuna Bot" trên Node, từ form "Hỏi ẩn danh" hoặc từ một câu hỏi cộng đồng. `assistant.js` dùng từ khóa + dữ liệu Node + cẩm nang tại `learning-guides.js` để tạo phản hồi gợi ý và link điều hướng. Bot **không tích hợp mô hình ngôn ngữ, không học dữ liệu người dùng, không gọi API AI**, không cố tạo lời giải cho chủ đề không có trong seed; những trường hợp đó gợi ý cách hỏi cụ thể/hỏi ẩn danh. Lịch sử chat lưu trong localStorage của trình duyệt (tối đa 24 tin), có nút xóa. Các câu hỏi chat **không tự đăng vào cộng đồng**.

Cập nhật này không thay thế 4 tính năng gốc: bot là bước giải thích nhanh trước/sau khi gửi hỏi đáp ẩn danh, và cẩm nang bổ sung cho quan hệ tiên quyết của bản đồ kiến thức.

## Chạy ở máy tính (không cần cài package)

Yêu cầu Node.js >=20:

```bash
node server.mjs
# Mở http://localhost:3000
```

Máy chủ development sử dụng file JSON tại `.local/community/` để lưu hỏi đáp, phản hồi, đồng cảm và góp ý qua API. Các Node, trạng thái và lưu Node được quản lý tương ứng trong `data.js` và localStorage của trình duyệt.

Kiểm thử:

```bash
npm test
npm run check
```

## Triển khai Vercel

1. Tạo một project Vercel mới, để **Other** / `framework: null` (static HTML và Vercel Function trong `api/`).
2. Kết nối một Vercel Blob store truy cập **public** với project (vì nội dung cộng đồng là công khai). Store tự tạo biến `BLOB_READ_WRITE_TOKEN`; **không** đưa token vào Git hoặc code trình duyệt.
3. Deploy toàn bộ source. `api/community.js` sử dụng Blob để lưu từng câu hỏi, phản hồi và lượt đồng cảm thành các object tách biệt. `@vercel/blob` được cài từ `package.json` khi deploy.
4. Mở domain đã triển khai, tạo câu hỏi ở một thiết bị và mở lại trên thiết bị khác để kiểm thử nội dung công khai được đồng bộ. Trạng thái tự học, checklist và chat bot chỉ lưu cục bộ; có thể xuất/nhập JSON.

**Giới hạn backend MVP:** Vercel Blob là object storage, không phải cơ sở dữ liệu giao dịch. Cách lưu mỗi tương tác thành một object giúp tránh ghi đè toàn bộ feed, nhưng truy vấn nhiều object sẽ trở nên tốn kém khi tăng quy mô. Một số tình huống đồng thời/độ trễ và chống spam chưa ở mức production; khi triển khai rộng, chuyển Q&A sang PostgreSQL/Supabase/Neon, thêm auth, moderation, giới hạn tốc độ theo tài khoản/IP, captcha và các chính sách vận hành.

## Cấu trúc

```text
index.html              khung giao diện + SEO cơ bản
assistant.js             quy tắc chatbot mô phỏng, có fallback minh bạch
learning-guides.js       các cẩm nang mẫu cho 4 môn học
styles.css              responsive styling
app.js                  route, bản đồ, quiz, cộng đồng, modal, trạng thái
icons.js                biểu tượng SVG inline
data.js                 nội dung minh họa (có thể sửa hoặc thay bằng API CMS)
api/community.js        serverless API trên Vercel (Vercel Blob)
lib/community.js        kiểm tra dữ liệu, nghiệp vụ hỏi đáp, đồng cảm
lib/local-store.js      adapter lưu dữ liệu local để thử trên máy
server.mjs              local HTTP server không cần dependency
tests/                  kiểm tra logic, toàn vẹn sơ đồ, API nghiệp vụ
vercel.json             header bảo mật cơ bản
```

## Thay nội dung minh họa bằng nguồn thật

Trong `data.js`, mỗi `course` gồm `id`, `name`, `code`, `tags`, ... Mỗi `node` gồm `id`, `courseId`, `stage`, `deps`, `summary`, `points`, `pitfall`, `flash`, `resources`. Phải giữ `id` Node ổn định để không mất liên kết Q&A và trạng thái đã lưu. Đối chiếu học liệu với giảng viên trước khi đánh dấu nguồn đã kiểm chứng; không tự đặt nhãn xác thực.

## Gợi ý sử dụng khi phỏng vấn giải pháp

Cho người tham gia tự thao tác luồng: **chọn môn → mở bản đồ → vào Node → đọc kiến thức → tự kiểm tra → đánh dấu “Cần gỡ rối” → hỏi ẩn danh → đồng cảm hoặc phản hồi**, rồi vào **Hướng dẫn & góp ý** để ghi nhận phản hồi. Đừng giải thích trước chi tiết UI để tránh ảnh hưởng đến đánh giá trực quan của họ.

## v1.2 — giao diện tối giản, tập trung thao tác

- Trang chủ chỉ còn lựa chọn môn học, mở bot, hỏi đáp và các nội dung đã lưu. Bỏ bảng thống kê và các đoạn giới thiệu lặp lại.
- Trong môn học, bản đồ kiến thức là nội dung chính. Cẩm nang bài tập lớn, yêu cầu giảng viên và thi/đánh giá được đặt trong mục **mở khi cần**; dữ liệu vẫn giữ nguyên.
- Trong từng Node, hiển thị phần cốt lõi, hai nút **Hỏi Kizuna Bot / Hỏi ẩn danh**, **một câu Flash-check mỗi lượt**, ba trạng thái hiểu bài và nút **Tôi cũng đang kẹt**. Học liệu/lỗi thường gặp/kiến thức liên quan mở rộng được.
- Cộng đồng giữ thao tác tìm câu hỏi, đánh dấu đồng cảm, phản hồi; trình bày ít hộp hướng dẫn hơn.
- Trên điện thoại, thứ tự hiển thị: học → Flash-check → tự đánh dấu → hỏi đáp. Không làm thay đổi dữ liệu người học lưu trước đó (`kizuna-mvp-state-v1`).
- Backend cộng đồng và nội dung chatbot mô phỏng **không thay đổi** so với v1.1.

### Kiểm thử

```bash
npm run check
npm test
```

Trên source v1.2, kiểm thử nghiệp vụ: 8/8 đạt. Kiểm tra UI trình duyệt chạy qua Chromium bằng bản ghép module nội bộ (do môi trường chặn điều hướng HTTP): các thao tác mở cẩm nang, chuyển tab, Flash-check, mở tài liệu và chatbot hoạt động, không có lỗi JavaScript; không có tràn ngang màn hình 390px và 1440px.


## v1.2.3 — Hỏi Bot ở mọi tab
- Nút nổi **Hỏi Bot** luôn xuất hiện trên Trang chủ, Môn học, bản đồ từng môn, Node, Hỏi đáp, Đã lưu và Trợ giúp.
- Mở cửa sổ bot tại trang đang xem, không đổi đường dẫn; đóng bot là quay lại trang đó.
- Tại trang Node, bot tự nhận Node hiện tại làm ngữ cảnh.
- Kể cả sau khi chuyển tab, nút vẫn hiện; lịch sử trao đổi vẫn được lưu cục bộ.
- Giao diện chatbot và backend cộng đồng không thay đổi.


## Bản đồ kiến thức v1.3 — tối giản, dễ theo dõi

- Bốn chặng học (Nền tảng → Khái niệm → Kết nối → Thực hành), tương thích desktop/mobile.
- Thẻ Node mở ngay bài học; dòng **Học sau** nêu kiến thức tiên quyết theo dữ liệu mô phỏng.
- Gợi ý **Học tiếp** chỉ là gợi ý; không khóa quyền mở bất kỳ Node nào. Thuật toán ưu tiên Node chưa được đánh dấu 'Đã thông suốt' có mọi điều kiện tiên quyết đã được đánh dấu tương tự.
- Desktop hiển thị đường nối quan hệ tiên quyết; hover/focus giúp làm nổi bật Node liên quan. Mobile thay bằng luồng dọc và thông tin tiên quyết ngắn.
- Ngay trong bài học, các Node học trước được liên kết để mở nhanh.
- Không thay đổi API cộng đồng, Chatbot mô phỏng, Flash-check hay dữ liệu đã lưu.
- Chạy kiểm thử: `npm test`.

Ghi chú: Nội dung kiến thức của MVP là **minh họa**, không phải chương trình chuẩn chính thức hay thứ tự học bắt buộc.


## Nguồn học phần công khai (v1.4)

Thêm `course-evidence.js` cho bốn môn IT4062/IT4062E, IT4409, IT3190/IT3190E và IT4735.
Trong một môn, nhấn “Bài giảng, bài tập lớn & cách chấm thi” để mở năm mục: Bài giảng, Bài tập lớn, Yêu cầu GV, Chấm điểm, Kiểm tra.
Mỗi thông tin có nguồn đều dẫn đến trang gốc, không sao chép nội dung slide. Các quy định nộp bài, điểm và hình thức thi của **lớp hiện tại** phải được xác nhận trên LMS HUST; ví dụ cũ có nhãn năm/lớp.
Danh sách nguồn và ghi chú nằm trong `course-evidence.js`.
