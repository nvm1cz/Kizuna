/**
 * ĐỐI CHIẾU HỌC PHẦN CÔNG KHAI (Kizuna MVP).
 * Các trang khóa học và đề cương có thể thuộc lớp/kỳ học khác.
 * Không suy luận tỷ trọng điểm hay ngày thi cho học kỳ đang diễn ra.
 * captured: 2026-11-17. Links are source pages, not mirrored copyrighted slides.
 */
export const courseEvidence = {
  network: {
    code:'IT4062 / IT4062E',
    note:'Thông tin công khai thuộc các lớp/phiên bản khác nhau; không áp dụng nguyên xi cho lớp hiện tại.',
    lectures:[
      {title:'Socket API, TCP và UDP',desc:'Bài giảng C cơ bản, Socket API, TCP server/client và UDP server/client.',url:'https://users.soict.hust.edu.vn/linhtd/courses/NetworkProg/',source:'Trang bài giảng IT4062E – TS. Trương Diệu Linh'},
      {title:'Lập trình đồng thời và giao thức',desc:'Multi-thread TCP server, select(), signal và thiết kế giao thức ứng dụng.',url:'https://users.soict.hust.edu.vn/linhtd/courses/NetworkProg/',source:'Bài 6–7 trên trang IT4062E'},
      {title:'Lộ trình bài tập C, TCP, UDP',desc:'Lịch bài giảng và ví dụ forking, multithread, I/O multiplexing, non-blocking socket.',url:'https://users.soict.hust.edu.vn/tungbt/it4062/',source:'Trang IT4062 – ThS. Bùi Trọng Tùng'}
    ],
    requirements:[
      {title:'Trong ví dụ lớp IT4062 (trang lưu trữ)',detail:'Bài tập có mã nguồn + Makefile, quy cách nén và nộp bài. Trang này nêu môi trường Ubuntu 20.04, GCC, chuẩn C11. Không coi đây là yêu cầu lớp hiện tại.',url:'https://users.soict.hust.edu.vn/tungbt/it4062/'},
      {title:'Với bài tập lớn',detail:'Một số lớp yêu cầu mini project có thiết kế giao thức, demo và báo cáo; ví dụ dự án chat đa người dùng, HTTP client. Kiểm tra lại đề và mốc nộp trên LMS.',url:'https://users.soict.hust.edu.vn/linhtd/courses/NetworkProg/'}
    ],
    grading:[
      {title:'50% bài tập + 50% mini project',detail:'Tỷ trọng được ghi trên trang IT4062 của giảng viên Bùi Trọng Tùng. Áp dụng cho trang/lớp được mô tả tại đó, không xác nhận kỳ hiện tại.',period:'Lớp công khai trước đây',url:'https://users.soict.hust.edu.vn/tungbt/it4062/'},
      {title:'30% quá trình + 70% project',detail:'Ví dụ ở đề cương IT4062 phiên bản 2011; hình thức cuối kỳ là bảo vệ và báo cáo project, không thi viết.',period:'Đề cương lưu trữ 2011',url:'https://users.soict.hust.edu.vn/hoangph/courses/IT4062/it4062_syllabus.pdf'},
      {title:'Rubric bài tập (ví dụ)',detail:'Một trang IT4062 công khai ghi 70% tính năng chạy đúng và 30% clean code. Đây là cách chấm bài tập của trang đó, KHÔNG phải rubric chung.',period:'Trang giảng viên – lưu trữ',url:'https://users.soict.hust.edu.vn/tungbt/it4062/'}
    ],
    tests:[
      {title:'Bài tập/lab',detail:'Lập trình socket, kiểm thử server/client, xử lý lỗi và đa kết nối; trang IT4062 có bài tập theo từng bài giảng.',url:'https://users.soict.hust.edu.vn/tungbt/it4062/'},
      {title:'Bảo vệ mini project',detail:'Ví dụ tại IT4062E: presentation sản phẩm, kiểm tra giao thức, minh họa chức năng, báo cáo thiết kế và đánh giá.',url:'https://users.soict.hust.edu.vn/linhtd/courses/NetworkProg/'},
      {title:'Thi cuối kỳ?',detail:'Không thể kết luận có/không có thi viết cho mọi lớp: các trang công khai mô tả cách đánh giá khác nhau. Xem đề cương/LMS của lớp.'}
    ]
  },
  web: {
    code:'IT4409',note:'Trang khóa học công khai xác nhận mục tiêu và kiến thức nền; chưa tìm thấy rubric/đề thi hiện hành công khai cho từng lớp.',
    lectures:[
      {title:'Tổng quan phát triển ứng dụng web',desc:'Theo SoICT: xây dựng ứng dụng và dịch vụ trực tuyến, CMS/Portal, e-commerce và framework web.',url:'https://gplx.daotao.ai/courses/course-v1%3ASoICT%2BIT4409%2B2023-1-144942/about',source:'Mô tả học phần IT4409 – SoICT'},
      {title:'HTML, CSS, JavaScript',desc:'Tài liệu thực hành mở của MDN để ôn kiến thức nền và thao tác DOM.',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development',source:'MDN – học liệu bổ trợ, không phải slide HUST'},
      {title:'HTTP và giao tiếp client–server',desc:'Tổng quan HTTP request, response và trạng thái, dùng khi thực hiện REST API.',url:'https://developer.mozilla.org/en-US/docs/Web/HTTP',source:'MDN – tài liệu bổ trợ'},
      {title:'Slide và đề tham khảo do cộng đồng sưu tầm',desc:'Bản tổng hợp của bên thứ ba; đối chiếu với tài liệu giảng viên nếu sử dụng.',url:'https://tailieuhust.com/cong-nghe-web-va-dich-vu-truc-tuyen/',source:'Nguồn không chính thức'}
    ],
    requirements:[
      {title:'Điều kiện học trước',detail:'Trang IT4409 nêu Cơ sở dữ liệu (IT3090/IT3091) và Lập trình hướng đối tượng (IT3100/IT3600) là các học phần học trước.',url:'https://gplx.daotao.ai/courses/course-v1%3ASoICT%2BIT4409%2B2023-1-144942/about'},
      {title:'Làm nhóm và thuyết trình',detail:'Mô tả học phần đề cập đến kỹ năng làm việc nhóm và thuyết trình. Framework, deadline, báo cáo và yêu cầu deploy của từng lớp phải hỏi giảng viên.',url:'https://gplx.daotao.ai/courses/course-v1%3ASoICT%2BIT4409%2B2023-1-144942/about'}
    ],
    grading:[
      {title:'Chưa có tỷ trọng chính thức công khai',detail:'Chưa xác minh được trọng số bài tập, project và thi cho lớp IT4409 hiện tại. Kizuna không tự đưa ra con số.'},
      {title:'Nội dung nên hỏi khi nhận rubric',detail:'Tỷ lệ chấm chức năng, code, tài liệu, demo và làm việc nhóm; hỏi rõ cách trừ điểm khi thiếu tính năng.'}
    ],
    tests:[
      {title:'Bài tập và demo web (mẫu luyện tập)',detail:'Dựng trang responsive, xử lý DOM, form; triển khai API CRUD, kết nối frontend–backend và giải thích luồng request.',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development'},
      {title:'Thi giữa/cuối kỳ',detail:'Không tìm thấy thông báo công khai đủ tin cậy cho lớp hiện tại. Hình thức tự luận/trắc nghiệm/thực hành cần kiểm tra trên LMS.'}
    ]
  },
  ml: {
    code:'IT3190 / IT3190E',note:'Số liệu trong bài giảng năm 2025 của một giảng viên, chỉ để tham khảo; không khẳng định là quy định 2026.1.',
    lectures:[
      {title:'Bộ slide Học máy & Khai phá dữ liệu',desc:'Giới thiệu, tiền xử lý, hồi quy, K-means, kNN, random forest, SVM, mạng nơron, đánh giá và luật kết hợp.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/',source:'Giảng viên HUST – kho bài giảng'},
      {title:'Bài giới thiệu môn IT3190 (2025)',desc:'12 nhóm bài, mục tiêu học phần, hướng dẫn capstone project, đánh giá và tài liệu đọc.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf',source:'Khoát Thân – Intro.pdf (2025)'},
      {title:'Sách đọc tổng hợp IT3190',desc:'Các chương: hồi quy, phân cụm, cây quyết định, SVM, xác suất, mạng nơron và đánh giá mô hình.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190-Tai-lieu-doc.pdf',source:'Giảng viên HUST – tài liệu đọc'}
    ],
    requirements:[
      {title:'Capstone project – ví dụ 2025',detail:'Tài liệu 2025 nêu nhóm 3–4 người; đề xuất bài toán, dataset, phương pháp; nộp code dạng ZIP, README hướng dẫn chạy và báo cáo kết quả thực nghiệm.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'},
      {title:'Tiêu chí thuyết trình – ví dụ 2025',detail:'Mô tả bài toán, tính phù hợp của phương pháp, độ chặt chẽ thực nghiệm, báo cáo và trình bày. Bài giới thiệu 2025 ghi 15 phút trình bày + demo; cần kiểm tra lịch mới.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'},
      {title:'Quy định sử dụng AI – chỉ ở tài liệu 2025',detail:'Tài liệu này ghi không sử dụng ChatGPT hoặc hệ thống tương tự để tạo code/báo cáo. Không áp dụng mặc định sang các lớp khác; cần đọc chính sách lớp hiện hành.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'}
    ],
    grading:[
      {title:'40% giữa kỳ / project + 60% cuối kỳ',detail:'Cơ cấu được ghi trong slide mở đầu môn Học máy & Khai phá dữ liệu của giảng viên Khoát Thân (2025).',period:'Ví dụ từ bài giảng 2025',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'},
      {title:'Tiêu chí đánh giá project',detail:'Khó khăn bài toán, phương pháp phù hợp, thực nghiệm chặt chẽ, chất lượng trình bày và báo cáo. Không có tỷ trọng chi tiết giữa các tiêu chí.',period:'Bài giảng 2025',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'}
    ],
    tests:[
      {title:'Giữa kỳ – project (ví dụ 2025)',detail:'Lựa chọn bài toán và dữ liệu, mô hình, lập trình, đánh giá rồi thuyết trình nhóm.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'},
      {title:'Cuối kỳ – kiểm tra online hoặc trên giấy',detail:'Slide giới thiệu 2025 liệt kê online test hoặc paper-based test; không quy định đề hiện tại là trắc nghiệm hay tự luận.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'},
      {title:'Nội dung ôn tập',detail:'Tiền xử lý, hồi quy, phân cụm, phân lớp, SVM, neural networks, đánh giá mô hình và lựa chọn tham số.',url:'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/'}
    ]
  },
  iot: {
    code:'IT4735',note:'SoICT công bố mục tiêu/nội dung và dự án IoT; không thấy công khai tỷ trọng chấm hoặc dạng thi lớp hiện tại.',
    lectures:[
      {title:'Kiến trúc IoT & thành phần hệ thống',desc:'Mô hình phân lớp, cảm biến và thiết bị, ứng dụng thực tế.',url:'https://soict.daotao.ai/courses/course-v1%3ASoICT%2BIT4735%2B2023-1-144947/about',source:'Mô tả học phần IT4735 – SoICT'},
      {title:'Truyền thông và dữ liệu IoT',desc:'Giao thức truyền, thu thập/xử lý/lưu trữ/trình bày dữ liệu và vấn đề bảo mật.',url:'https://soict.daotao.ai/courses/course-v1%3ASoICT%2BIT4735%2B2023-1-144947/about',source:'SoICT – mô tả nội dung học phần'},
      {title:'MQTT pub/sub và broker',desc:'Bộ tài liệu kỹ thuật để thực hiện bài tập project với topic, QoS, broker.',url:'https://mosquitto.org/documentation/',source:'Mosquitto – tài liệu bổ trợ'},
      {title:'Thực hành cảm biến/vi điều khiển',desc:'Ví dụ Arduino, đọc sensor và giao tiếp thiết bị để tham khảo.',url:'https://docs.arduino.cc/',source:'Arduino – tài liệu bổ trợ'}
    ],
    requirements:[
      {title:'Kiến thức nền được đề cập',detail:'Trang IT4735 liệt kê các học phần học trước IT3030 (Kiến trúc máy tính), IT3080 (Mạng máy tính).',url:'https://soict.daotao.ai/courses/course-v1%3ASoICT%2BIT4735%2B2023-1-144947/about'},
      {title:'Thiết kế và triển khai ứng dụng',detail:'Mô tả học phần yêu cầu thực hiện các bước phân tích, thiết kế, xây dựng và triển khai ứng dụng IoT; đồng thời thực hành làm nhóm và thuyết trình.',url:'https://soict.daotao.ai/courses/course-v1%3ASoICT%2BIT4735%2B2023-1-144947/about'}
    ],
    grading:[
      {title:'Chưa tìm thấy rubric hoặc tỷ trọng chính thức',detail:'Không suy đoán điểm quá trình, phần cứng, dashboard và thi. Chỉ đánh giá theo công bố của từng lớp.'},
      {title:'Rubric tự kiểm tra dự án (không chấm điểm)',detail:'Chạy được luồng sensor → broker → dashboard; xử lý mất mạng, dữ liệu lỗi; giải thích kiến trúc và giới hạn.'}
    ],
    tests:[
      {title:'Thực hành project IoT',detail:'Theo mô tả IT4735: phân tích, thiết kế và triển khai một ứng dụng IoT; hình thức bảo vệ và số điểm tùy lớp.',url:'https://soict.daotao.ai/courses/course-v1%3ASoICT%2BIT4735%2B2023-1-144947/about'},
      {title:'Các dạng kiểm tra để tự luyện (minh họa)',detail:'Giải thích kiến trúc IoT, kết nối cảm biến, lựa chọn giao thức, lưu trữ/hiển thị dữ liệu, bảo mật và quyền riêng tư.'}
    ]
  }
};
