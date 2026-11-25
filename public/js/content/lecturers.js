/**
 * THÔNG TIN GIẢNG VIÊN & CÁCH CHẤM ĐIỂM — do nhóm Kizuna biên tập, người dùng chỉ xem.
 *
 * kind: 'public' = người thật, CHỈ ghi điều có trong nguồn công khai (sources). Không biết thì để null.
 *       'sample' = nhân vật hư cấu để minh họa bố cục, thay bằng dữ liệu nhóm thu thập được.
 * grading: các thành phần điểm, tổng weight phải bằng 100. Mảng rỗng = nguồn không nêu tỷ trọng.
 * Không tự viết nhận xét tính cách, điểm danh cho người thật khi chưa có nguồn.
 */
export const lecturers = {
  network: [
    {
      id: 'net-tung', kind: 'public', name: 'Bùi Trọng Tùng', role: 'IT4062 · lớp HEDSPI', asOf: 'Trang môn học, 2023',
      style: null,
      attendance: null,
      homework: 'Nộp mã nguồn kèm Makefile. Môi trường chấm: Ubuntu 20.04, GCC, chuẩn C11.',
      rules: 'Nộp trễ dưới 24 giờ trừ 20%, dưới 48 giờ trừ 40%, sau đó không nhận. Sao chép bài là trượt môn.',
      grading: [{label: 'Bài tập', weight: 50}, {label: 'Mini project', weight: 50}],
      gradingNote: 'Mỗi bài tập: 70% chạy đúng chức năng, 30% trình bày mã nguồn.',
      sources: [{title: 'Trang IT4062', url: 'https://users.soict.hust.edu.vn/tungbt/it4062/'}]
    },
    {
      id: 'net-linh', kind: 'public', name: 'Trương Diệu Linh', role: 'IT4062E', asOf: 'Trang môn học, 2019',
      style: null,
      attendance: null,
      homework: 'Làm project theo nhóm, có các mốc kiểm tra tiến độ trong kỳ.',
      rules: 'Cuối kỳ gồm thuyết trình, demo sản phẩm và báo cáo in của nhóm.',
      grading: [],
      gradingNote: 'Kết quả các mốc tiến độ tính điểm giữa kỳ. Thuyết trình và sản phẩm cuối tính điểm cuối kỳ. Nguồn không nêu tỷ trọng.',
      sources: [{title: 'Trang IT4062E', url: 'https://users.soict.hust.edu.vn/linhtd/courses/NetworkProg/'}]
    },
    {
      id: 'net-a', kind: 'sample', name: 'Giảng viên A', role: 'Lập trình mạng',
      style: 'Nhiệt tình, hay hỏi bài giữa giờ, thích sinh viên giải thích được từng dòng code.',
      attendance: 'Điểm danh 4–5 buổi ngẫu nhiên. Vắng quá 3 buổi bị trừ 1 điểm quá trình.',
      homework: 'Mỗi tuần một bài lab nhỏ, nộp trước buổi sau.',
      rules: 'Ưu tiên chạy được với nhiều client hơn là giao diện đẹp.',
      grading: [{label: 'Chuyên cần', weight: 10}, {label: 'Lab', weight: 30}, {label: 'Bài tập lớn', weight: 60}],
      gradingNote: 'Bài tập lớn vấn đáp từng thành viên, điểm trong nhóm có thể khác nhau.',
      sources: []
    },
    {
      id: 'net-b', kind: 'sample', name: 'Giảng viên B', role: 'Lập trình mạng',
      style: 'Điềm đạm, giảng kỹ lý thuyết, trả lời email nhanh.',
      attendance: 'Không điểm danh, nhưng có quiz ngắn đầu giờ.',
      homework: 'Ba bài tập lớn dần, dùng lại code của bài trước.',
      rules: 'Không nhận bài trễ.',
      grading: [{label: 'Giữa kỳ', weight: 40}, {label: 'Cuối kỳ', weight: 60}],
      gradingNote: 'Giữa kỳ trắc nghiệm, cuối kỳ viết chương trình server theo mô tả giao thức.',
      sources: []
    }
  ],
  web: [
    {
      id: 'web-a', kind: 'sample', name: 'Giảng viên C', role: 'Công nghệ web',
      style: 'Cởi mở, khuyến khích thử công nghệ mới, hay mời sinh viên demo trước lớp.',
      attendance: 'Điểm danh đầu giờ bằng mã QR.',
      homework: 'Bài thực hành hằng tuần trên trình duyệt và API.',
      rules: 'Được chọn framework, nhưng phải giải thích được luồng request.',
      grading: [{label: 'Quá trình', weight: 40}, {label: 'Bài tập lớn', weight: 60}],
      gradingNote: 'Bài tập lớn chấm chức năng, chất lượng mã và phần bảo vệ.',
      sources: []
    },
    {
      id: 'web-b', kind: 'sample', name: 'Giảng viên D', role: 'Công nghệ web',
      style: 'Nghiêm túc, đúng giờ, chấm kỹ phần bảo mật.',
      attendance: 'Không điểm danh thường xuyên.',
      homework: 'Hai bài tập cá nhân và một bài tập nhóm.',
      rules: 'Trễ mỗi ngày trừ 10% số điểm của bài.',
      grading: [{label: 'Giữa kỳ', weight: 30}, {label: 'Bài tập nhóm', weight: 20}, {label: 'Cuối kỳ', weight: 50}],
      gradingNote: 'Cuối kỳ trắc nghiệm kết hợp đọc mã.',
      sources: []
    }
  ],
  ml: [
    {
      id: 'ml-khoat', kind: 'public', name: 'Thân Quang Khoát', role: 'IT3190', asOf: 'Slide mở đầu, 2025',
      style: null,
      attendance: 'Có tính chuyên cần và mức độ tích cực. Nguồn không nêu tỷ trọng riêng.',
      homework: 'Capstone project nhóm 3–4 người, 15 phút trình bày và demo. Nộp mã nguồn ZIP, Readme và báo cáo.',
      rules: 'Phải khai báo thư viện, mã có sẵn. Không dùng ChatGPT hoặc công cụ tương tự để tạo mã hay báo cáo.',
      grading: [{label: 'Giữa kỳ (capstone)', weight: 40}, {label: 'Cuối kỳ', weight: 60}],
      gradingNote: 'Cuối kỳ thi online hoặc trên giấy. Project chấm độ khó, phương pháp, thực nghiệm, trình bày và báo cáo.',
      sources: [{title: 'Slide mở đầu IT3190', url: 'https://users.soict.hust.edu.vn/khoattq/ml-dm-course/IT3190/Intro.pdf'}]
    },
    {
      id: 'ml-a', kind: 'sample', name: 'Giảng viên E', role: 'Học máy',
      style: 'Thân thiện, nhiều ví dụ thực tế, dành thời gian hỏi đáp cuối buổi.',
      attendance: 'Điểm danh 3 buổi ngẫu nhiên, cộng điểm phát biểu.',
      homework: 'Hai bài notebook cá nhân.',
      rules: 'Notebook phải chạy lại được từ đầu.',
      grading: [{label: 'Chuyên cần', weight: 10}, {label: 'Giữa kỳ', weight: 30}, {label: 'Cuối kỳ', weight: 60}],
      gradingNote: 'Cuối kỳ tự luận, có bài tính tay.',
      sources: []
    }
  ],
  iot: [
    {
      id: 'iot-a', kind: 'sample', name: 'Giảng viên F', role: 'Internet of Things',
      style: 'Thực tế, hay kể chuyện dự án, thích sản phẩm chạy được.',
      attendance: 'Điểm danh theo nhóm ở các buổi thực hành.',
      homework: 'Một project xuyên suốt, báo cáo tiến độ hai tuần một lần.',
      rules: 'Được mô phỏng thiết bị nếu thiếu phần cứng.',
      grading: [{label: 'Tiến độ', weight: 30}, {label: 'Sản phẩm', weight: 50}, {label: 'Báo cáo', weight: 20}],
      gradingNote: 'Điểm sản phẩm dựa trên demo từ cảm biến tới dashboard.',
      sources: []
    },
    {
      id: 'iot-b', kind: 'sample', name: 'Giảng viên G', role: 'Internet of Things',
      style: 'Kỹ tính, chú trọng kiến trúc và bảo mật thiết bị.',
      attendance: 'Điểm danh mỗi buổi.',
      homework: 'Bài tập về giao thức và một bài tập nhóm.',
      rules: 'Vắng quá 20% số buổi không được bảo vệ.',
      grading: [{label: 'Quá trình', weight: 40}, {label: 'Cuối kỳ', weight: 60}],
      gradingNote: 'Cuối kỳ tự luận về kiến trúc, MQTT và bảo mật.',
      sources: []
    }
  ]
};
