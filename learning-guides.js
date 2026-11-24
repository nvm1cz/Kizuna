/**
 * BÀI TẬP LỚN MẪU — minh họa, không phải yêu cầu của giảng viên hiện tại.
 */
export const courseGuides = {
 network: {
  scenario: 'Xây dựng một chatroom TCP nhiều người dùng bằng C trên Linux/macOS',
  outcome: 'Một server nhận nhiều client, trao đổi thông điệp và xử lý các trường hợp ngắt kết nối an toàn.',
  project: [
   {title:'Chốt yêu cầu và phạm vi',detail:'Viết user story: client có thể JOIN, gửi MSG, xem danh sách /clients, QUIT. Chốt giới hạn số client và kích thước tin.',node:'net-foundation',output:'README mô tả chức năng và sơ đồ client–server.'},
   {title:'Thiết kế giao thức ứng dụng',detail:'Chọn thông điệp phân dòng hoặc length-prefix, xác định phản hồi OK/ERROR; với TCP nhớ rằng recv() có thể trả thiếu.',node:'net-framing',output:'Bảng lệnh, định dạng gói và sơ đồ trạng thái kết nối.'},
   {title:'Xây TCP server/client tối thiểu',detail:'Server: socket → bind → listen → accept; Client: socket → connect; hai bên thực hiện send/recv và kiểm tra lỗi.',node:'net-tcp',output:'Chạy được với một client và có nhật ký gửi/nhận.'},
   {title:'Hỗ trợ đồng thời',detail:'Chọn select/poll hoặc pthread. Nếu nhiều luồng ghi vào danh sách client chung, dùng mutex tại thao tác cập nhật.',node:'net-concurrency',output:'Hai hoặc nhiều client gửi đồng thời, broadcast đúng.'},
   {title:'Thử lỗi và hoàn thiện',detail:'Kiểm tra nhận thiếu, client thoát đột ngột, tin dài, lệnh sai, server restart và dọn socket/file descriptor.',node:'net-practice',output:'Bộ test thủ công hoặc tự động, ảnh minh họa và báo cáo.'}
  ],
  deliverables:['Mã nguồn server và client; lệnh build/run','Mô tả giao thức và kiến trúc','Phân công công việc nếu làm nhóm','Kịch bản kiểm thử và kết quả','Báo cáo ngắn + ảnh chụp/demo'],
  reference:{title:'Trang môn học công khai',description:'Yêu cầu dự án của các lớp trước có thể khác lớp bạn.',links:[{title:'Trang IT4062 — Bùi Trọng Tùng',url:'https://users.soict.hust.edu.vn/tungbt/it4062/'},{title:'Đề cương IT4062 — Phạm Huy Hoàng',url:'https://users.soict.hust.edu.vn/hoangph/courses/IT4062/it4062_syllabus.pdf'}]}
 },
 web:{
  scenario:'Xây website quản lý công việc nhóm có giao diện và REST API',
  outcome:'Một ứng dụng có trang danh sách, tạo/sửa/xóa nhiệm vụ và dữ liệu được lưu ở server.',
  project:[
   {title:'Xác định người dùng & chức năng',detail:'Viết 3 luồng: xem danh sách, tạo nhiệm vụ, cập nhật trạng thái. Xác định các trường id/title/status/owner.',node:'web-html',output:'User flow, wireframe giao diện mobile và desktop.'},
   {title:'Tạo giao diện có tương tác',detail:'Dùng HTML ngữ nghĩa, CSS responsive và JS DOM để tạo form, bộ lọc, trạng thái rỗng/loading.',node:'web-js',output:'Trang chạy được với dữ liệu giả (mock).'},
   {title:'Đặc tả API',detail:'Thiết kế GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id; xác định HTTP status cho lỗi.',node:'web-http',output:'Bảng endpoint và mẫu JSON request/response.'},
   {title:'Kết nối client–server',detail:'Dùng fetch/async-await, kiểm tra response.ok, xử lý mất kết nối và nhập dữ liệu không hợp lệ.',node:'web-async',output:'Frontend thao tác được với API thật.'},
   {title:'Kiểm thử & triển khai',detail:'Validate ở cả frontend/backend, tránh XSS, chạy thử trên thiết bị nhỏ và viết hướng dẫn deploy.',node:'web-project',output:'Source, README, URL demo và checklist test.'}
  ],
  deliverables:['Repository có README và hướng dẫn chạy','Tài liệu yêu cầu và sơ đồ API','Giao diện responsive + backend hoạt động','Dữ liệu mẫu hoặc cách khởi tạo CSDL','Bài test lỗi phổ biến và URL demo']
 },
 ml:{
  scenario:'Xây quy trình dự đoán giá nhà bằng hồi quy và so sánh mô hình',
  outcome:'Notebook tái lập được: tiền xử lý → train → đánh giá → phân tích sai số, tránh rò rỉ dữ liệu.',
  project:[
   {title:'Đặt câu hỏi & chọn metric',detail:'Mục tiêu dự đoán giá liên tục, chọn MAE/RMSE và đặt baseline đơn giản.',node:'ml-basics',output:'Problem statement, metric và mô tả dữ liệu.'},
   {title:'Khảo sát và chia dữ liệu',detail:'Chia train/validation/test TRƯỚC khi fit imputer/scaler; kiểm tra missing values và ngoại lệ.',node:'ml-data',output:'Bảng mô tả tập dữ liệu + pipeline tránh leakage.'},
   {title:'Huấn luyện mô hình cơ bản',detail:'Chạy Linear Regression, Ridge, Lasso; giải thích ảnh hưởng regularization, điều chỉnh alpha trên validation.',node:'ml-regression',output:'Bảng so sánh baseline và các mô hình.'},
   {title:'Kiểm tra overfitting',detail:'Thử cây quyết định với độ sâu khác nhau; so sánh train/validation để phát hiện học thuộc.',node:'ml-trees',output:'Bảng hoặc đồ thị train/validation error.'},
   {title:'Đánh giá & báo cáo',detail:'Chỉ xem test khi chốt mô hình, phân tích residual và những điểm chưa chắc chắn.',node:'ml-evaluation',output:'Notebook, hình kết quả, kết luận có giới hạn.'}
  ],
  deliverables:['Notebook có seed và thứ tự thao tác chạy lại được','Nguồn dữ liệu và cách chia train/val/test','Bảng metric so sánh cùng split','Biểu đồ sai số/phân tích kết quả','Slide hoặc báo cáo kết luận và hạn chế']
 },
 iot:{
  scenario:'Thiết kế hệ thống giám sát nhiệt độ và độ ẩm qua MQTT',
  outcome:'Dữ liệu cảm biến giả lập/thiết bị thật được gửi lên broker và hiển thị dashboard có cảnh báo.',
  project:[
   {title:'Mô tả kiến trúc hệ thống',detail:'Xác định cảm biến, thiết bị, broker, service và dashboard. Đặt kỳ lấy mẫu 5 giây (minh họa).',node:'iot-intro',output:'Sơ đồ và giả định phạm vi.'},
   {title:'Thu nhận dữ liệu',detail:'Đọc cảm biến hoặc dùng script giả lập; xác định đơn vị °C/%RH và giá trị lỗi.',node:'iot-hardware',output:'Một luồng dữ liệu JSON hợp lệ có timestamp.'},
   {title:'Đưa dữ liệu qua mạng',detail:'Chọn Wi-Fi hoặc mạng giả lập; xử lý reconnect và thiết bị mất mạng.',node:'iot-network',output:'Thiết bị kết nối và gửi dữ liệu thử.'},
   {title:'Định nghĩa topic và MQTT',detail:'Ví dụ topic lab/roomA/temperature, QoS và retained message tùy nhu cầu; test subscribe bằng một client khác.',node:'iot-mqtt',output:'Sơ đồ topic + log publish/subscribe.'},
   {title:'Hiển thị và kiểm thử',detail:'Hiển thị nhiệt độ theo thời gian, cờ cảnh báo, mô phỏng mất tín hiệu và dữ liệu sai.',node:'iot-project',output:'Dashboard demo, test case, README và báo cáo.'}
  ],
  deliverables:['Sơ đồ thiết bị–mạng–broker–dashboard','Mã mô phỏng hoặc firmware cảm biến','Quy ước MQTT topic và payload','Dashboard + test mất mạng/dữ liệu sai','Video/ảnh demo + hướng dẫn chạy lại']
 }
};
