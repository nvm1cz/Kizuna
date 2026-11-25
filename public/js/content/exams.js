/**
 * ÔN THI — đề giữa kỳ và cuối kỳ tham khảo.
 *
 * papers   = đề do cộng đồng chia sẻ công khai (chỉ dẫn link, không sao chép nội dung).
 *            Nguồn: tailieuhust.com → Google Drive, đối chiếu ngày 2026-11-24.
 * practice = đề tự luyện do nhóm Kizuna tự biên soạn, không phải đề thật.
 * Mỗi câu tự luyện gắn với một Node để ôn lại.
 */
const drive = id => `https://drive.google.com/file/d/${id}/view`;
const folder = id => `https://drive.google.com/drive/folders/${id}`;

export const examTerms = [['mid', 'Giữa kỳ'], ['final', 'Cuối kỳ']];

export const exams = {
  network: {
    mid: {
      papers: [
        {title: 'Giữa kỳ 20132 · mã đề 217', detail: 'PDF', url: drive('1lSFNuK3Npwm7UCAA4qGYK4sR3dawRMFA')},
        {title: 'Giữa kỳ 20132 · mã đề 515', detail: 'PDF', url: drive('1Xr8fYjQm9PlrzdtNVkGcWQf-XSamSC2X')},
        {title: 'Giữa kỳ 20122', detail: 'PDF', url: drive('14Zb7hqTJpodZCGhTEwTqFscSr8J7Hl2J')},
        {title: 'Giữa kỳ 20121 · mã đề 247', detail: '90 phút, không tài liệu, trắc nghiệm 6 điểm', url: drive('1M0Pbw8L3fkYx-_2pMMG9qlXBO1aLz5My')},
        {title: 'Giữa kỳ 20121 · mã đề 513', detail: 'PDF', url: drive('1Jec7dotOOFpBMA-mSFy-q3WSHWtliHpQ')}
      ],
      note: 'Đề đã cũ, có câu về WinSock trên Windows. Lớp hiện tại có thể dùng socket trên Linux.',
      practice: {
        title: 'Đề tự luyện giữa kỳ', time: '45 phút',
        questions: [
          {q: 'Một server đang lắng nghe ở cổng 8080. Vì sao 500 client vẫn kết nối được đồng thời vào cùng cổng đó?', a: 'Mỗi kết nối TCP được phân biệt bằng bộ bốn (IP nguồn, cổng nguồn, IP đích, cổng đích). Các client khác nhau ở IP hoặc cổng nguồn nên không trùng nhau.', node: 'net-foundation'},
          {q: 'Sắp xếp đúng thứ tự các lời gọi phía TCP server: accept, bind, recv, listen, socket. Nêu vai trò của từng bước.', a: 'socket → bind → listen → accept → recv. socket tạo descriptor, bind gắn địa chỉ và cổng, listen chuyển sang chờ kết nối, accept trả socket mới cho từng client, recv đọc dữ liệu.', node: 'net-tcp'},
          {q: 'Client gọi send() hai lần, mỗi lần 100 byte. Server gọi recv() một lần với bộ đệm 1024 byte. Server có thể nhận được bao nhiêu byte?', a: 'Bất kỳ số nào từ 1 đến 200 (hoặc 0 nếu kết nối đã đóng). TCP là luồng byte, không giữ ranh giới giữa các lần send().', node: 'net-tcp'},
          {q: 'Gửi một datagram UDP 2000 byte nhưng phía nhận gọi recvfrom() với bộ đệm 1000 byte. Điều gì xảy ra?', a: 'Chỉ 1000 byte đầu được trả về, phần còn lại của datagram đó bị bỏ. Lần recvfrom() sau đọc datagram kế tiếp.', node: 'net-udp'},
          {q: 'getaddrinfo() trả về ba địa chỉ cho một tên miền. Client nên xử lý thế nào?', a: 'Duyệt lần lượt: tạo socket phù hợp rồi connect; nếu lỗi thì đóng socket và thử địa chỉ tiếp theo. Sau cùng gọi freeaddrinfo().', node: 'net-dns'}
        ]
      }
    },
    final: {
      papers: [
        {title: 'Trắc nghiệm cuối kỳ 20222', detail: '5 trang, trắc nghiệm và điền đáp án', url: drive('1_gDK_dwFIIZG3yhzN5UdIBFGoWeOFDvn')},
        {title: 'Cuối kỳ 20132', detail: '90 phút, không tài liệu, giao thức chat TCP', url: drive('1L5LtxIoSmdB6pGwxSZFnfXr4ogyySE1O')},
        {title: 'Cuối kỳ 20122 · IT4060', detail: '60 phút, được dùng tài liệu, viết server', url: drive('11bBNrUgxB53Z3LC5I0C6CfQHNs8-Hu47')},
        {title: 'Ngân hàng câu hỏi · Lương Ánh Hoàng', detail: '10 trang trắc nghiệm', url: drive('1-0uy0R5A-CPCU2g-O27OL3rRNb7ehlHl')},
        {title: 'Đề 1–4 và đáp án', detail: 'Thư mục Google Drive', url: folder('1OFjGHstMYGkm6oktZJAFJO-lqwdy3_Tv')}
      ],
      note: 'Một số đề thuộc mã học phần cũ IT4060. Có lớp đánh giá cuối kỳ bằng project thay cho bài thi.',
      practice: {
        title: 'Đề tự luyện cuối kỳ', time: '90 phút',
        questions: [
          {q: 'Thiết kế khung thông điệp cho ứng dụng chat TCP có các lệnh JOIN, MSG, QUIT. Nêu cách bên nhận biết một thông điệp đã kết thúc.', a: 'Ví dụ: 1 byte loại lệnh, 4 byte độ dài (thứ tự byte mạng), sau đó là nội dung. Bên nhận đọc lặp đủ 5 byte header rồi đọc lặp đủ số byte nội dung, và từ chối độ dài vượt giới hạn.', node: 'net-framing'},
          {q: 'Viết hàm recv_all(fd, buf, n) bảo đảm đọc đủ n byte hoặc báo lỗi.', a: 'Lặp: r = recv(fd, buf + got, n - got, 0). Nếu r == 0 thì phía kia đã đóng; nếu r < 0 và errno là EINTR thì thử lại, lỗi khác thì dừng; ngược lại got += r cho tới khi got == n.', node: 'net-framing'},
          {q: 'So sánh select() và epoll khi server có 10.000 kết nối nhưng mỗi lúc chỉ vài chục kết nối có dữ liệu.', a: 'select() phải truyền và quét lại toàn bộ tập descriptor mỗi lần gọi, thường bị giới hạn FD_SETSIZE. epoll giữ tập theo dõi trong kernel và chỉ trả về các descriptor có sự kiện nên phù hợp hơn.', node: 'net-concurrency'},
          {q: 'Hai luồng cùng chạy clients[count++] = fd. Lỗi gì có thể xảy ra và sửa thế nào?', a: 'Race condition: hai luồng đọc cùng giá trị count nên ghi đè nhau hoặc mất một lần tăng. Dùng mutex bao trọn đoạn kiểm tra giới hạn, ghi phần tử và tăng count.', node: 'net-concurrency'},
          {q: 'Viết luồng xử lý lệnh DOWNLOAD <tên tệp> phía server, gồm cả trường hợp tệp không tồn tại và tên tệp chứa “../”.', a: 'Kiểm tra tên tệp (chặn đường dẫn ra ngoài thư mục cho phép), mở tệp, gửi mã lỗi nếu thất bại. Nếu được thì gửi kích thước trước, sau đó đọc và gửi từng khối, lặp send() tới khi hết.', node: 'net-file'},
          {q: 'Viết phản hồi HTTP/1.1 hoàn chỉnh khi không tìm thấy trang, nội dung là chuỗi “Not found”.', a: 'HTTP/1.1 404 Not Found\\r\\nContent-Type: text/plain\\r\\nContent-Length: 9\\r\\n\\r\\nNot found', node: 'net-http'}
        ]
      }
    }
  },
  web: {
    mid: {
      papers: [],
      practice: {
        title: 'Đề tự luyện giữa kỳ', time: '45 phút',
        questions: [
          {q: 'Khi nào dùng <a>, khi nào dùng <button>? Nêu hệ quả nếu dùng <div> cho cả hai.', a: '<a> để điều hướng, <button> để thực hiện hành động. <div> không nhận focus bàn phím, không có vai trò ngữ nghĩa nên trình đọc màn hình khó nhận biết.', node: 'web-html'},
          {q: 'Đoạn btn.addEventListener("click", save()) sai ở đâu?', a: 'save() được gọi ngay khi gắn sự kiện và giá trị trả về mới là thứ được truyền vào. Cần truyền hàm: addEventListener("click", save).', node: 'web-js'},
          {q: 'Vì sao gán nội dung người dùng vào innerHTML là nguy hiểm? Nêu cách thay thế.', a: 'Trình duyệt sẽ phân tích chuỗi thành HTML nên có thể bị XSS. Dùng textContent hoặc làm sạch dữ liệu trước khi chèn.', node: 'web-js'},
          {q: 'Thiết kế endpoint REST cho danh sách công việc: xem, tạo, đổi trạng thái, xóa. Ghi rõ method và mã trả về khi thành công.', a: 'GET /tasks → 200; POST /tasks → 201; PATCH /tasks/:id → 200; DELETE /tasks/:id → 204.', node: 'web-http'}
        ]
      }
    },
    final: {
      papers: [
        {title: 'Trắc nghiệm Công nghệ web', detail: 'PDF, tải lên năm 2021', url: drive('1FKERH32b6L7jIPdWvfcuOUiVlro6v5a5')},
        {title: 'Thư mục đề 2019–2020', detail: 'Thư mục Google Drive', url: folder('1NVaIuxux9Sr2h0lEBNY_lTC5jrTpNGEa')},
        {title: 'Tất cả đề tham khảo', detail: 'Thư mục Google Drive', url: folder('1yY3p1yJlZ9dzXMEZ9j696g-WkFPo8jVo')}
      ],
      note: 'Đề cũ có nhiều câu về PHP. Hãy so với công nghệ lớp bạn đang dùng.',
      practice: {
        title: 'Đề tự luyện cuối kỳ', time: '60 phút',
        questions: [
          {q: 'fetch() nhận phản hồi 500. Khối catch có chạy không? Viết cách xử lý đúng.', a: 'Không, vì fetch chỉ reject khi lỗi mạng. Cần kiểm tra if (!res.ok) throw new Error(res.status) trước khi đọc dữ liệu.', node: 'web-async'},
          {q: 'So sánh 401 và 403, cho ví dụ.', a: '401: chưa xác thực, ví dụ chưa đăng nhập. 403: đã xác thực nhưng không đủ quyền, ví dụ sinh viên gọi API quản trị.', node: 'web-http'},
          {q: 'Vì sao vẫn phải kiểm tra dữ liệu ở server dù đã kiểm tra ở client?', a: 'Client do người dùng kiểm soát, có thể gọi thẳng API. Kiểm tra ở client chỉ giúp trải nghiệm, kiểm tra ở server mới bảo vệ dữ liệu.', node: 'web-backend'},
          {q: 'Nêu ba trạng thái giao diện cần có khi tải danh sách từ API và một cách kiểm thử cho mỗi trạng thái.', a: 'Đang tải: làm chậm mạng. Rỗng: trả về mảng rỗng. Lỗi: cho API trả 500 hoặc ngắt mạng.', node: 'web-project'}
        ]
      }
    }
  },
  ml: {
    mid: {
      papers: [],
      practice: {
        title: 'Đề tự luyện giữa kỳ', time: '45 phút',
        questions: [
          {q: 'Phân loại các bài toán: dự đoán giá nhà, lọc thư rác, gom nhóm khách hàng.', a: 'Hồi quy, phân lớp, phân cụm. Hai bài đầu là học có giám sát, bài cuối là không giám sát.', node: 'ml-basics'},
          {q: 'Chuẩn hóa toàn bộ dữ liệu rồi mới chia train/test gây vấn đề gì?', a: 'Rò rỉ dữ liệu: mean và độ lệch chuẩn đã chứa thông tin của tập test nên kết quả đánh giá lạc quan. Cần fit scaler chỉ trên train.', node: 'ml-data'},
          {q: 'Viết hàm mục tiêu của Ridge và Lasso. Phương pháp nào có thể đưa hệ số về đúng 0?', a: 'Ridge: ||y − Xw||² + λ||w||₂². Lasso: ||y − Xw||² + λ||w||₁. Lasso có thể đưa hệ số về 0.', node: 'ml-regression'},
          {q: 'Cây quyết định đạt 100% trên train và 70% trên test. Nêu hiện tượng và hai cách khắc phục.', a: 'Overfitting. Giới hạn độ sâu hoặc số mẫu tối thiểu ở lá, cắt tỉa cây, hoặc dùng random forest.', node: 'ml-trees'}
        ]
      }
    },
    final: {
      papers: [],
      practice: {
        title: 'Đề tự luyện cuối kỳ', time: '90 phút',
        questions: [
          {q: 'Cho TP = 40, FP = 10, FN = 20, TN = 130. Tính accuracy, precision, recall và F1.', a: 'Accuracy = 170/200 = 0,85. Precision = 40/50 = 0,8. Recall = 40/60 ≈ 0,667. F1 = 2·0,8·0,667/(0,8+0,667) ≈ 0,727.', node: 'ml-evaluation'},
          {q: 'Trong SVM, điều gì xảy ra với nghiệm nếu bỏ đi một mẫu không phải support vector?', a: 'Nghiệm không đổi, vì hệ số đối ngẫu của mẫu đó bằng 0.', node: 'ml-svm'},
          {q: 'Tăng tham số C của SVM ảnh hưởng thế nào tới margin và nguy cơ overfitting?', a: 'C lớn phạt lỗi trên train mạnh hơn nên margin có xu hướng hẹp lại và nguy cơ overfitting tăng.', node: 'ml-svm'},
          {q: 'Trình bày k-fold cross-validation và cách dùng để chọn λ cho Ridge.', a: 'Chia train thành k phần; với mỗi λ, lần lượt dùng một phần để kiểm tra và k−1 phần để huấn luyện, lấy trung bình lỗi. Chọn λ có lỗi trung bình nhỏ nhất rồi huấn luyện lại trên toàn bộ train.', node: 'ml-evaluation'}
        ]
      }
    }
  },
  iot: {
    mid: {
      papers: [],
      practice: {
        title: 'Đề tự luyện giữa kỳ', time: '45 phút',
        questions: [
          {q: 'Vẽ kiến trúc một hệ thống IoT giám sát nhà kính và chỉ ra sensor, actuator, gateway, dịch vụ.', a: 'Sensor: nhiệt độ, độ ẩm. Actuator: quạt, bơm. Gateway thu thập và chuyển tiếp. Dịch vụ lưu trữ, cảnh báo và hiển thị dashboard.', node: 'iot-intro'},
          {q: 'ADC 10 bit, điện áp tham chiếu 5 V đọc được giá trị 512. Điện áp đầu vào khoảng bao nhiêu?', a: '512/1023 × 5 ≈ 2,5 V.', node: 'iot-hardware'},
          {q: 'Nêu hai cách giảm nhiễu số đo cảm biến và nhược điểm của mỗi cách.', a: 'Trung bình trượt: mượt hơn nhưng trễ. Lấy trung vị: loại đột biến tốt nhưng cần lưu nhiều mẫu.', node: 'iot-hardware'},
          {q: 'Thiết bị mất Wi-Fi 10 phút. Thiết kế cách để không mất dữ liệu.', a: 'Lưu tạm kèm timestamp vào hàng đợi có giới hạn, thử kết nối lại với thời gian chờ tăng dần, gửi bù theo thứ tự khi có mạng.', node: 'iot-network'}
        ]
      }
    },
    final: {
      papers: [],
      practice: {
        title: 'Đề tự luyện cuối kỳ', time: '60 phút',
        questions: [
          {q: 'So sánh QoS 0, 1, 2 trong MQTT. Chọn mức phù hợp cho nhiệt độ đo mỗi 5 giây và cho lệnh mở khóa cửa.', a: 'QoS 0: tối đa một lần. QoS 1: ít nhất một lần, có thể trùng. QoS 2: đúng một lần. Nhiệt độ dùng QoS 0; lệnh mở khóa dùng QoS 2, hoặc QoS 1 kèm mã lệnh chống trùng.', node: 'iot-mqtt'},
          {q: 'Retained message khác persistent session thế nào?', a: 'Retained: broker giữ tin cuối của topic và gửi cho subscriber mới. Persistent session: broker giữ đăng ký và tin QoS 1, 2 cho một client khi nó tạm ngắt kết nối.', node: 'iot-mqtt'},
          {q: 'Dashboard hiển thị 28 °C nhưng cảm biến đã mất kết nối một giờ. Cần bổ sung gì?', a: 'Hiển thị thời điểm đo cuối, trạng thái offline, làm mờ số cũ và cảnh báo khi quá ngưỡng thời gian.', node: 'iot-dashboard'},
          {q: 'Liệt kê bốn trường hợp kiểm thử cho hệ thống giám sát nhiệt độ qua MQTT.', a: 'Luồng bình thường; mất mạng rồi kết nối lại; dữ liệu sai định dạng hoặc ngoài khoảng; broker dừng hoạt động.', node: 'iot-project'}
        ]
      }
    }
  }
};
