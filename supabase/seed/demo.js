/**
 * DỮ LIỆU MẪU để xem thử: 7 môn đại cương và cơ sở ngành, câu hỏi, người đóng góp hư cấu.
 * Nội dung học do AI soạn, năm học của môn là tạm. Nhóm cần kiểm tra trước khi dùng thật.
 * Sinh ra supabase/04_demo.sql và 05_demo_cleanup.sql bằng "npm run seed".
 */
import {majors} from './programs.js';

const all = (...schools) => majors.filter(m => schools.includes(m.schoolId)).map(m => m.id);
const TECH = all('soict', 'seee', 'sme', 'fami', 'fep', 'smse', 'scls');
const IT = all('soict');

/** Node: [mã, chặng, tên, học trước, tóm tắt, bẫy, câu hỏi, giải thích, tên tài liệu, liên kết] */
export const demoCourses = [
  {id: 'mi1111', code: 'MI1111', name: 'Giải tích 1', icon: 'book', color: '#c9607f', soft: '#fdeaf0', year: 1, majors: TECH, nodes: [
    ['gioi-han', 0, 'Giới hạn hàm số', [], 'Giới hạn mô tả giá trị mà f(x) tiến tới khi x tiến tới a. Hàm số không cần xác định tại a.', 'Nhầm giới hạn tại a với giá trị f(a). Hai đại lượng này chỉ bằng nhau khi hàm liên tục tại a.', 'Giới hạn của sin(x)/x khi x tiến tới 0 bằng bao nhiêu?', 'Bằng 1, dù biểu thức không xác định tại x = 0.', 'Paul’s Online Notes: Limits', 'https://tutorial.math.lamar.edu/Classes/CalcI/LimitsIntro.aspx'],
    ['lien-tuc', 0, 'Hàm số liên tục', ['gioi-han'], 'Hàm liên tục tại a khi giới hạn tại a tồn tại và bằng f(a).', 'Cho rằng hàm có giới hạn tại a thì chắc chắn liên tục tại a.', 'Hàm f(x) = |x| có liên tục tại 0 không?', 'Có. Giới hạn hai phía đều bằng 0 và f(0) = 0, dù hàm không có đạo hàm tại đó.', 'Paul’s Online Notes: Continuity', 'https://tutorial.math.lamar.edu/Classes/CalcI/Continuity.aspx'],
    ['dao-ham', 1, 'Đạo hàm và vi phân', ['lien-tuc'], 'Đạo hàm là tốc độ thay đổi tức thời, bằng hệ số góc của tiếp tuyến. Có đạo hàm thì liên tục.', 'Suy ngược: liên tục thì có đạo hàm. Điều này sai, ví dụ |x| tại 0.', 'Đạo hàm của sin(x²) là gì?', '2x·cos(x²), theo quy tắc hàm hợp.', 'Paul’s Online Notes: Derivatives', 'https://tutorial.math.lamar.edu/Classes/CalcI/DerivativeIntro.aspx'],
    ['tich-phan', 2, 'Tích phân xác định', ['dao-ham'], 'Tích phân xác định là giới hạn của tổng Riemann. Công thức Newton - Leibniz nối nó với nguyên hàm.', 'Coi tích phân luôn là diện tích. Phần đồ thị nằm dưới trục hoành cho giá trị âm.', 'Tích phân của x từ 0 đến 2 bằng bao nhiêu?', 'Bằng 2, vì nguyên hàm là x²/2.', 'Paul’s Online Notes: Integrals', 'https://tutorial.math.lamar.edu/Classes/CalcI/IntegralsIntro.aspx'],
    ['suy-rong', 3, 'Tích phân suy rộng', ['tich-phan'], 'Tích phân suy rộng có cận vô hạn hoặc hàm không bị chặn, được định nghĩa qua giới hạn.', 'Thấy hàm tiến về 0 thì kết luận tích phân hội tụ. Hàm 1/x trên [1, +∞) vẫn phân kỳ.', 'Tích phân của 1/x² từ 1 đến vô cùng hội tụ hay phân kỳ?', 'Hội tụ và bằng 1.', 'Paul’s Online Notes: Improper Integrals', 'https://tutorial.math.lamar.edu/Classes/CalcII/ImproperIntegrals.aspx']
  ]},
  {id: 'mi1141', code: 'MI1141', name: 'Đại số', icon: 'compass', color: '#b58a2a', soft: '#fdf4dc', year: 1, majors: TECH, nodes: [
    ['ma-tran', 0, 'Ma trận và phép toán', [], 'Ma trận là bảng số chữ nhật. Phép nhân AB cần số cột của A bằng số hàng của B.', 'Cho rằng AB = BA. Phép nhân ma trận nói chung không giao hoán.', 'A cỡ 2×3, B cỡ 3×4 thì AB có cỡ nào?', 'Cỡ 2×4. Tích BA không xác định.', 'MIT OCW 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'],
    ['dinh-thuc', 0, 'Định thức', ['ma-tran'], 'Định thức chỉ có với ma trận vuông. Định thức khác 0 khi và chỉ khi ma trận khả nghịch.', 'Dùng det(A + B) = det(A) + det(B). Công thức này sai.', 'Đổi chỗ hai hàng thì định thức thay đổi thế nào?', 'Đổi dấu.', 'MIT OCW 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'],
    ['he-pt', 1, 'Hệ phương trình tuyến tính', ['dinh-thuc'], 'Hệ có nghiệm khi hạng ma trận hệ số bằng hạng ma trận mở rộng (Kronecker - Capelli).', 'Thấy số phương trình bằng số ẩn thì kết luận hệ có nghiệm duy nhất.', 'Hệ thuần nhất luôn có nghiệm nào?', 'Nghiệm tầm thường, mọi ẩn bằng 0.', 'MIT OCW 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'],
    ['khong-gian', 2, 'Không gian vectơ', ['he-pt'], 'Cơ sở là hệ vectơ độc lập tuyến tính và sinh ra cả không gian. Số vectơ trong cơ sở là số chiều.', 'Cho rằng hệ sinh nào cũng là cơ sở. Hệ sinh còn phải độc lập tuyến tính.', 'Ba vectơ bất kỳ trong mặt phẳng R² có thể độc lập tuyến tính không?', 'Không, vì R² chỉ có 2 chiều.', 'MIT OCW 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'],
    ['tri-rieng', 3, 'Trị riêng và vectơ riêng', ['khong-gian'], 'λ là trị riêng của A nếu có vectơ v khác 0 sao cho Av = λv. Tìm λ từ det(A − λI) = 0.', 'Nhận vectơ 0 làm vectơ riêng. Vectơ riêng phải khác 0.', 'Ma trận có trị riêng bằng 0 thì có khả nghịch không?', 'Không, vì khi đó định thức bằng 0.', 'MIT OCW 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/']
  ]},
  {id: 'it1110', code: 'IT1110', name: 'Tin học đại cương', icon: 'cpu', color: '#4a8fbd', soft: '#e5f3fb', year: 1, majors: TECH, nodes: [
    ['bieu-dien', 0, 'Biểu diễn số trong máy tính', [], 'Máy tính lưu số bằng bit. Số nguyên có dấu thường dùng mã bù 2, số thực dùng dấu phẩy động.', 'Cho rằng 0.1 + 0.2 luôn đúng bằng 0.3. Số thực chỉ được lưu gần đúng.', 'Số nguyên có dấu 8 bit biểu diễn được khoảng nào?', 'Từ −128 đến 127 với mã bù 2.', 'CS50x', 'https://cs50.harvard.edu/x/'],
    ['bien-kieu', 0, 'Biến và kiểu dữ liệu trong C', ['bieu-dien'], 'Kiểu dữ liệu quyết định kích thước và cách hiểu vùng nhớ. Biến phải khai báo trước khi dùng.', 'Chia hai số nguyên rồi mong được số thực: 5 / 2 trong C cho kết quả 2.', 'Giá trị của (float)5 / 2 là gì?', '2.5, vì ép kiểu trước khi chia.', 'cppreference: ngôn ngữ C', 'https://en.cppreference.com/w/c/language'],
    ['dieu-khien', 1, 'Rẽ nhánh và vòng lặp', ['bien-kieu'], 'if, switch chọn nhánh thực hiện; for, while, do - while lặp lại một khối lệnh.', 'Viết if (a = 5) thay cho if (a == 5). Phép gán làm điều kiện luôn đúng.', 'do - while khác while ở điểm nào?', 'do - while thực hiện thân vòng lặp ít nhất một lần.', 'cppreference: câu lệnh trong C', 'https://en.cppreference.com/w/c/language/statements'],
    ['mang-ham', 2, 'Mảng và hàm', ['dieu-khien'], 'Mảng lưu nhiều phần tử cùng kiểu liên tiếp. Khi truyền vào hàm, mảng được truyền dưới dạng con trỏ.', 'Truy cập phần tử ngoài mảng. C không báo lỗi, hành vi không xác định.', 'int a[5] có chỉ số hợp lệ nào?', 'Từ 0 đến 4.', 'cppreference: mảng trong C', 'https://en.cppreference.com/w/c/language/array'],
    ['con-tro', 3, 'Con trỏ', ['mang-ham'], 'Con trỏ lưu địa chỉ. Toán tử & lấy địa chỉ, toán tử * truy cập giá trị tại địa chỉ.', 'Dùng con trỏ chưa khởi tạo hoặc đã giải phóng.', 'Vì sao hàm swap(int a, int b) không đổi được hai biến bên ngoài?', 'Vì C truyền tham trị. Cần truyền con trỏ tới hai biến.', 'cppreference: con trỏ trong C', 'https://en.cppreference.com/w/c/language/pointer']
  ]},
  {id: 'it3011', code: 'IT3011', name: 'Cấu trúc dữ liệu và giải thuật', icon: 'sprout', color: '#4c9a8c', soft: '#e6f5ef', year: 2, majors: IT, nodes: [
    ['do-phuc-tap', 0, 'Độ phức tạp thuật toán', [], 'Ký hiệu O mô tả chặn trên tốc độ tăng của thời gian chạy khi kích thước dữ liệu tăng.', 'So sánh hai thuật toán chỉ bằng O mà quên hằng số và kích thước dữ liệu thực tế.', 'Hai vòng lặp lồng nhau, mỗi vòng n lần, có độ phức tạp nào?', 'O(n²).', 'VisuAlgo', 'https://visualgo.net/en'],
    ['danh-sach', 1, 'Danh sách, ngăn xếp, hàng đợi', ['do-phuc-tap'], 'Ngăn xếp vào sau ra trước, hàng đợi vào trước ra trước. Danh sách liên kết chèn nhanh khi đã có vị trí.', 'Cho rằng danh sách liên kết truy cập phần tử thứ k nhanh như mảng. Thực tế là O(k).', 'Cấu trúc nào phù hợp để kiểm tra dấu ngoặc cân bằng?', 'Ngăn xếp.', 'VisuAlgo: Linked List', 'https://visualgo.net/en/list'],
    ['sap-xep', 1, 'Sắp xếp', ['do-phuc-tap'], 'Merge sort luôn O(n log n). Quick sort trung bình O(n log n) nhưng trường hợp xấu là O(n²).', 'Nghĩ quick sort luôn nhanh hơn merge sort trong mọi trường hợp.', 'Thuật toán sắp xếp ổn định nghĩa là gì?', 'Giữ nguyên thứ tự tương đối của các phần tử có khóa bằng nhau.', 'VisuAlgo: Sorting', 'https://visualgo.net/en/sorting'],
    ['cay', 2, 'Cây nhị phân tìm kiếm', ['danh-sach'], 'Khóa ở cây con trái nhỏ hơn gốc, cây con phải lớn hơn gốc. Duyệt giữa cho dãy tăng dần.', 'Cho rằng tìm kiếm luôn O(log n). Cây lệch hẳn một phía thì thành O(n).', 'Duyệt giữa một cây nhị phân tìm kiếm cho kết quả gì?', 'Dãy khóa tăng dần.', 'VisuAlgo: Binary Search Tree', 'https://visualgo.net/en/bst'],
    ['do-thi', 3, 'Đồ thị và tìm đường', ['cay', 'sap-xep'], 'BFS tìm đường ít cạnh nhất. Dijkstra tìm đường ngắn nhất khi trọng số không âm.', 'Dùng Dijkstra cho đồ thị có cạnh trọng số âm.', 'Muốn tìm đường ngắn nhất khi có cạnh âm, không có chu trình âm, dùng thuật toán nào?', 'Bellman - Ford.', 'VisuAlgo: Shortest Paths', 'https://visualgo.net/en/sssp']
  ]},
  {id: 'it3070', code: 'IT3070', name: 'Nguyên lý hệ điều hành', icon: 'cpu', color: '#6b7294', soft: '#eceef6', year: 3, majors: IT, nodes: [
    ['tien-trinh', 0, 'Tiến trình', [], 'Tiến trình là chương trình đang chạy, có không gian địa chỉ riêng và khối điều khiển tiến trình.', 'Nhầm chương trình với tiến trình. Một chương trình có thể có nhiều tiến trình.', 'Sau lời gọi fork(), giá trị trả về ở tiến trình con là gì?', 'Bằng 0. Tiến trình cha nhận mã của tiến trình con.', 'OSTEP: Processes', 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf'],
    ['luong', 1, 'Luồng', ['tien-trinh'], 'Các luồng trong một tiến trình dùng chung bộ nhớ nhưng có ngăn xếp và thanh ghi riêng.', 'Cho rằng biến toàn cục được cập nhật an toàn khi nhiều luồng cùng ghi.', 'Luồng có dùng chung ngăn xếp không?', 'Không, mỗi luồng có ngăn xếp riêng.', 'OSTEP: Threads', 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf'],
    ['dong-bo', 2, 'Đồng bộ và tắc nghẽn', ['luong'], 'Khóa và semaphore bảo vệ vùng găng. Tắc nghẽn cần đủ 4 điều kiện: loại trừ, giữ và chờ, không chiếm đoạt, chờ vòng.', 'Chỉ khóa khi ghi mà không khóa khi đọc dữ liệu dùng chung.', 'Phá điều kiện chờ vòng bằng cách nào?', 'Quy định thứ tự xin khóa thống nhất cho mọi luồng.', 'OSTEP: Locks', 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf'],
    ['lap-lich', 1, 'Lập lịch CPU', ['tien-trinh'], 'FCFS, SJF, Round Robin, ưu tiên là các chiến lược chọn tiến trình được chạy tiếp.', 'Cho rằng lượng tử thời gian càng nhỏ càng tốt. Quá nhỏ thì tốn chi phí chuyển ngữ cảnh.', 'Thuật toán nào có thời gian chờ trung bình nhỏ nhất nếu biết trước thời gian chạy?', 'SJF, với các tiến trình cùng đến một lúc.', 'OSTEP: Scheduling', 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf'],
    ['bo-nho-ao', 3, 'Bộ nhớ ảo và phân trang', ['dong-bo', 'lap-lich'], 'Mỗi tiến trình thấy không gian địa chỉ riêng. Bảng trang ánh xạ trang ảo sang khung vật lý.', 'Cho rằng lỗi trang luôn là lỗi chương trình. Thường nó chỉ báo cần nạp trang vào bộ nhớ.', 'TLB dùng để làm gì?', 'Lưu tạm các ánh xạ trang gần đây để dịch địa chỉ nhanh hơn.', 'OSTEP: Paging', 'https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf']
  ]},
  {id: 'it3080', code: 'IT3080', name: 'Mạng máy tính', icon: 'network', color: '#5978d8', soft: '#eaf0ff', year: 3, majors: IT, nodes: [
    ['mo-hinh', 0, 'Mô hình phân tầng', [], 'TCP/IP chia thành các tầng, mỗi tầng dùng dịch vụ của tầng dưới và phục vụ tầng trên.', 'Nhầm tầng của thiết bị: switch làm việc chủ yếu ở tầng liên kết, router ở tầng mạng.', 'Đơn vị dữ liệu của tầng giao vận TCP gọi là gì?', 'Segment.', 'RFC 1122', 'https://www.rfc-editor.org/rfc/rfc1122'],
    ['ung-dung', 1, 'Tầng ứng dụng: DNS và HTTP', ['mo-hinh'], 'DNS đổi tên miền thành địa chỉ IP. HTTP trao đổi yêu cầu và phản hồi giữa trình duyệt và máy chủ.', 'Cho rằng DNS chỉ dùng UDP. DNS cũng dùng TCP khi phản hồi lớn hoặc chuyển vùng.', 'Mã 301 và 302 khác nhau thế nào?', '301 là chuyển hướng vĩnh viễn, 302 là tạm thời.', 'MDN: HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'],
    ['giao-van', 1, 'Tầng giao vận: TCP và UDP', ['mo-hinh'], 'TCP bảo đảm thứ tự và truyền lại; UDP gửi nhanh, không bảo đảm.', 'Nhầm điều khiển luồng (bảo vệ bên nhận) với điều khiển tắc nghẽn (bảo vệ mạng).', 'Bắt tay ba bước gồm những gói nào?', 'SYN, SYN-ACK, ACK.', 'RFC 9293: TCP', 'https://www.rfc-editor.org/rfc/rfc9293'],
    ['dia-chi-ip', 2, 'Địa chỉ IP và chia mạng con', ['giao-van', 'ung-dung'], 'Mặt nạ mạng chia địa chỉ thành phần mạng và phần máy. CIDR viết dạng /n.', 'Quên trừ địa chỉ mạng và địa chỉ quảng bá khi đếm số máy.', 'Mạng /26 có bao nhiêu địa chỉ dùng cho máy?', '62, vì 2⁶ − 2 = 62.', 'RFC 4632: CIDR', 'https://www.rfc-editor.org/rfc/rfc4632'],
    ['dinh-tuyen', 3, 'Định tuyến', ['dia-chi-ip'], 'Định tuyến trạng thái liên kết (OSPF) và vectơ khoảng cách (RIP) là hai nhóm chính trong một hệ tự trị.', 'Cho rằng router chọn dòng khớp đầu tiên. Router chọn dòng khớp tiền tố dài nhất.', 'BGP dùng ở đâu?', 'Giữa các hệ tự trị trên Internet.', 'RFC 2328: OSPF', 'https://www.rfc-editor.org/rfc/rfc2328']
  ]},
  {id: 'it3090', code: 'IT3090', name: 'Cơ sở dữ liệu', icon: 'file', color: '#8a77be', soft: '#f0ebff', year: 3, majors: IT, nodes: [
    ['mo-hinh-er', 0, 'Mô hình thực thể - liên kết', [], 'Mô hình ER mô tả thực thể, thuộc tính và liên kết trước khi thiết kế bảng.', 'Biến thuộc tính đa trị thành một cột chứa nhiều giá trị ngăn bằng dấu phẩy.', 'Liên kết nhiều - nhiều chuyển sang bảng thế nào?', 'Tạo bảng trung gian chứa khóa của hai thực thể.', 'PostgreSQL: Data Definition', 'https://www.postgresql.org/docs/current/ddl.html'],
    ['sql', 1, 'Truy vấn SQL', ['mo-hinh-er'], 'SELECT, JOIN, GROUP BY, HAVING là các thành phần chính của truy vấn.', 'Dùng WHERE để lọc kết quả hàm gộp. Phải dùng HAVING.', 'LEFT JOIN khác INNER JOIN ở điểm nào?', 'LEFT JOIN giữ mọi dòng bên trái, kể cả khi không có dòng khớp.', 'PostgreSQL: Queries', 'https://www.postgresql.org/docs/current/queries.html'],
    ['chuan-hoa', 2, 'Phụ thuộc hàm và chuẩn hóa', ['sql'], 'Chuẩn hóa giảm dư thừa và bất thường khi cập nhật. 3NF loại phụ thuộc bắc cầu vào khóa.', 'Tách bảng tùy ý mà làm mất thông tin khi kết nối lại.', 'Quan hệ ở 2NF nhưng có phụ thuộc bắc cầu thì vi phạm chuẩn nào?', '3NF.', 'PostgreSQL: Constraints', 'https://www.postgresql.org/docs/current/ddl-constraints.html'],
    ['chi-muc', 2, 'Chỉ mục', ['sql'], 'Chỉ mục B-tree tăng tốc tìm kiếm theo khóa và theo khoảng, đổi lại ghi chậm hơn.', 'Tạo chỉ mục cho mọi cột. Mỗi chỉ mục làm chậm thao tác ghi và tốn bộ nhớ.', 'Vì sao LIKE \'%abc\' thường không dùng được chỉ mục B-tree?', 'Vì không biết tiền tố để dò trong cây.', 'Use The Index, Luke', 'https://use-the-index-luke.com/'],
    ['giao-dich', 3, 'Giao dịch', ['chuan-hoa', 'chi-muc'], 'Giao dịch bảo đảm ACID: nguyên tử, nhất quán, cô lập, bền vững.', 'Cho rằng mức cô lập mặc định luôn ngăn mọi bất thường khi chạy song song.', 'Đọc bẩn là gì?', 'Đọc dữ liệu mà giao dịch khác chưa commit.', 'PostgreSQL: Transaction Isolation', 'https://www.postgresql.org/docs/current/transaction-iso.html']
  ]}
];

/** [Node, biệt danh, tiêu đề, nội dung, phản hồi mẫu] */
export const demoQuestions = [
  ['it3011-cay', 'Sóc Kiên Nhẫn', 'Khi nào cây nhị phân tìm kiếm bị lệch?', 'Mình chèn dãy tăng dần thì cây thành một đường thẳng, có cách nào tránh không?', 'Bạn xem cây cân bằng như AVL hoặc đỏ đen, chúng tự xoay sau mỗi lần chèn.'],
  ['it3011-sap-xep', 'Thỏ Hay Hỏi', 'Quick sort có ổn định không?', '', 'Bản cài đặt thông thường không ổn định, vì đổi chỗ các phần tử ở xa nhau.'],
  ['it3090-chuan-hoa', 'Cú Mèo Tri Thức', 'Chuẩn hóa đến mức nào là đủ?', 'Bài tập lớn của mình tách tới BCNF thì phải nối rất nhiều bảng.', 'Thường 3NF là đủ cho bài tập lớn, chỉ tách thêm khi thấy bất thường cập nhật thật sự.'],
  ['it3080-dia-chi-ip', 'Rái Cá Chăm Chỉ', 'Chia mạng con khi số máy không đều thì làm sao?', 'Đề cho 3 phòng có 50, 20 và 10 máy.', 'Dùng VLSM: cấp cho phòng lớn nhất trước, lần lượt /26, /27, /28.'],
  ['it3070-dong-bo', 'Hải Ly Tìm Hiểu', 'Semaphore khác mutex thế nào?', '', 'Mutex có chủ sở hữu và chỉ cho một luồng vào; semaphore đếm được số luồng.'],
  ['it1110-con-tro', 'Chim Sẻ Đi Học', 'Con trỏ và mảng có giống nhau không?', 'Mình thấy a[i] và *(a + i) ra cùng kết quả.', 'Tên mảng tự chuyển thành con trỏ trong nhiều biểu thức, nhưng sizeof của chúng khác nhau.'],
  ['mi1111-suy-rong', 'Gấu Học Hỏi', 'Xét hội tụ tích phân suy rộng bắt đầu từ đâu?', '', null],
  ['mi1141-tri-rieng', 'Mèo Tò Mò', 'Ma trận nào cũng chéo hóa được phải không?', 'Mình gặp ma trận có trị riêng bội 2 mà chỉ tìm được một vectơ riêng.', null]
];

/** Người đóng góp hư cấu: [tên, ngành, năm, số tài liệu đã duyệt]. Nhận biết bằng email @demo.hustree.invalid. */
export const demoPeople = [
  ['Phương Linh', 'IT1', 3, 9], ['Hoàng Nam', 'IT2', 4, 7], ['Minh Quân', 'IT-E6', 3, 5], ['Thu Hà', 'ET1', 2, 4],
  ['Đức Anh', 'IT-E10', 3, 3], ['Bảo Châu', 'MI1', 1, 2], ['Gia Huy', 'EE2', 2, 2], ['Ngọc Mai', 'IT1', 1, 1]
];

/** Tài liệu chờ admin duyệt: [số thứ tự người gửi, Node, tên, ghi chú, liên kết] */
export const demoPending = [
  [0, 'it3011-do-thi', 'Minh họa thuật toán Dijkstra', 'Có hình chạy từng bước, dễ hiểu hơn slide.', 'https://visualgo.net/en/sssp'],
  [3, 'it3090-sql', 'Bài tập SQL có chấm tự động', 'Làm trực tiếp trên web, có đáp án.', 'https://pgexercises.com/'],
  [5, 'mi1111-dao-ham', 'Chuỗi video Essence of Calculus', 'Giải thích bằng hình, hợp để học trước khi lên lớp.', 'https://www.3blue1brown.com/topics/calculus']
];
