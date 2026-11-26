/**
 * Trường, khoa và chương trình đào tạo đại học của HUST.
 * Nguồn (2026-11-25): hust.edu.vn (danh sách trường/khoa quản ngành), huongnghiep.hocmai.vn (mã và tên chương trình 2026).
 * Việc xếp chương trình vào trường/khoa do nhóm làm theo mã, cần kiểm tra lại.
 */
export const schools = [
  ['soict', 'Trường Công nghệ Thông tin và Truyền thông'],
  ['seee', 'Trường Điện - Điện tử'],
  ['sme', 'Trường Cơ khí'],
  ['scls', 'Trường Hoá và Khoa học Sự sống'],
  ['smse', 'Trường Vật liệu'],
  ['sem', 'Trường Kinh tế'],
  ['fami', 'Khoa Toán - Tin'],
  ['fep', 'Khoa Vật lý Kỹ thuật'],
  ['fofl', 'Khoa Ngoại ngữ'],
  ['fed', 'Khoa Khoa học và Công nghệ Giáo dục']
];

const PREFIX = {IT: 'soict', TROY: 'soict', EE: 'seee', ET: 'seee', ME: 'sme', TE: 'sme', HE: 'sme', BF: 'scls', CH: 'scls', EV: 'scls', MS: 'smse', TX: 'smse', EM: 'sem', MI: 'fami', PH: 'fep', FL: 'fofl', ED: 'fed'};

export const majors = `
IT1 | CNTT: Khoa học Máy tính
IT2 | CNTT: Kỹ thuật Máy tính
IT-E6 | Công nghệ Thông tin Việt - Nhật
IT-E7 | Công nghệ Thông tin Global ICT
IT-E10 | Khoa học Dữ liệu và Trí tuệ nhân tạo
IT-E15 | An toàn không gian số - Cyber Security
IT-EP | Công nghệ Thông tin Việt - Pháp
TROY-IT | Khoa học Máy tính - ĐH Troy
EE1 | Kỹ thuật điện
EE2 | Kỹ thuật Điều khiển - Tự động hóa
EE-E8 | Kỹ thuật điều khiển - Tự động hóa (CT tiên tiến)
EE-E18 | Hệ thống điện và năng lượng tái tạo (CT tiên tiến)
EE-EP | Tin học công nghiệp và Tự động hóa (PFIEV)
ET1 | Kỹ thuật điện tử - viễn thông
ET2 | Kỹ thuật y sinh
ET-E4 | Kỹ thuật Điện tử - Viễn thông (CT tiên tiến)
ET-E5 | Kỹ thuật Y sinh (CT tiên tiến)
ET-E9 | Hệ thống nhúng thông minh và IoT
ET-E16 | Truyền thông số và Kỹ thuật đa phương tiện (CT tiên tiến)
ET-LUH | Điện tử - Viễn thông - ĐH Leibniz Hannover
ME1 | Kỹ thuật cơ điện tử
ME2 | Kỹ thuật cơ khí
ME-E1 | Kỹ thuật Cơ điện tử (CT tiên tiến)
ME-GU | Cơ khí Chế tạo máy - ĐH Griffith
ME-LUH | Cơ điện tử - ĐH Leibniz Hannover
ME-NUT | Cơ điện tử - ĐHCN Nagaoka
TE1 | Kỹ thuật ô tô
TE2 | Kỹ thuật cơ khí động lực
TE3 | Kỹ thuật Hàng không
TE-E2 | Kỹ thuật Ô tô (CT tiên tiến)
TE-EP | Cơ khí Hàng không (PFIEV)
HE1 | Kỹ thuật nhiệt
BF1 | Kỹ thuật Sinh học
BF2 | Kỹ thuật Thực phẩm
BF-E12 | Kỹ thuật Thực phẩm (CT tiên tiến)
BF-E19 | Kỹ thuật sinh học (CT tiên tiến)
CH1 | Kỹ thuật hoá học
CH2 | Hoá học
CH-E11 | Kỹ thuật Hóa dược (CT tiên tiến)
CH-E20 | Hóa học Mỹ phẩm (CT tiên tiến)
EV1 | Kỹ thuật môi trường
EV2 | Quản lý tài nguyên và môi trường
MS1 | Kỹ thuật vật liệu
MS2 | Kỹ thuật Vi điện tử và Công nghệ nano
MS3 | Công nghệ vật liệu Polyme và Compozit
MS5 | Kỹ thuật in
MS-E3 | Khoa học và Kỹ thuật Vật liệu (CT tiên tiến)
TX1 | Công nghệ dệt, may
EM1 | Quản lý năng lượng
EM2 | Quản lý công nghiệp
EM3 | Quản trị kinh doanh
EM5 | Tài chính - Ngân hàng
EM-E13 | Phân tích Kinh doanh (CT tiên tiến)
EM-E14 | Logistics và Quản lý chuỗi cung ứng (CT tiên tiến)
EM-E17 | Kế toán (CT tiên tiến)
MI1 | Toán-Tin
MI2 | Hệ thống thông tin quản lý
MI-E22 | Khoa học tính toán cho các hệ thống thông minh (CT tiên tiến)
PH1 | Vật lý kỹ thuật
PH2 | Kỹ thuật hạt nhân
PH3 | Vật lý y khoa
FL1 | Tiếng Anh KHKT và Công nghệ
FL2 | Tiếng Anh chuyên nghiệp quốc tế
FL3 | Tiếng Trung KH&CN
FL4 | Tiếng Hàn KH&CN
ED2 | Công nghệ giáo dục
ED3 | Quản lý giáo dục
ED5 | Tâm lý học công nghiệp và tổ chức
`.trim().split('\n').map(line => {
  const [id, name] = line.split(' | ');
  return {id, name, schoolId: PREFIX[id.match(/^[A-Z]+/)[0]]};
});

/** Môn nằm ở năm nào của ngành nào. DỮ LIỆU TẠM để chạy thử, admin sửa theo khung chương trình thật. */
export const courseMajors = {
  network: [['IT1', 4], ['IT2', 4], ['IT-E6', 4], ['IT-E7', 4], ['IT-E15', 4]],
  web: [['IT1', 4], ['IT-E6', 4], ['IT-E7', 4]],
  ml: [['IT1', 3], ['IT2', 3], ['IT-E6', 3], ['IT-E7', 3], ['IT-E10', 3]],
  iot: [['IT1', 4], ['IT2', 4], ['IT-E6', 4], ['ET-E9', 3]]
};
