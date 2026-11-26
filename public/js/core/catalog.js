/** Nội dung học tải từ máy chủ sau khi đăng nhập. Các mảng giữ nguyên tham chiếu, chỉ thay phần tử. */
export const schools = [], majors = [], courses = [], nodes = [];
export const lecturers = {}, exams = {}, guides = {};

export const stages = ['Nền tảng', 'Khái niệm cốt lõi', 'Kết nối kiến thức', 'Thực hành'];
export const examTerms = [['mid', 'Giữa kỳ'], ['final', 'Cuối kỳ']];

const fillList = (target, list) => target.splice(0, target.length, ...(list || []));
const fillMap = (target, map) => {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, map || {});
};

export function setCatalog(data = {}) {
  fillList(schools, data.schools);
  fillList(majors, data.majors);
  fillList(courses, data.courses);
  fillList(nodes, data.nodes);
  fillMap(lecturers, data.lecturers);
  fillMap(exams, data.exams);
  fillMap(guides, data.guides);
}

export const getCourse = id => courses.find(c => c.id === id);
export const getNode = id => nodes.find(n => n.id === id);
export const nodesOf = id => nodes.filter(n => n.courseId === id);
export const getMajor = id => majors.find(m => m.id === id);
export const majorsOf = schoolId => majors.filter(m => m.schoolId === schoolId);

/** Môn của một ngành; truyền year để lọc đúng năm học. */
export const coursesFor = (majorId, year = null) =>
  courses.filter(c => c.majors.some(m => m.major === majorId && (year === null || m.year === year)));
