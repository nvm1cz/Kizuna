/** Mô tả biểu mẫu của từng loại nội dung. editor.js dựa vào đây để dựng và đọc biểu mẫu. */
import {exams, getCourse, getNode, guides, lecturers, majors, nodesOf, stages} from '../../core/catalog.js';
import {YEARS} from '../helpers.js';

const text = (key, label, extra = {}) => ({key, label, type: 'text', max: 200, ...extra});
const area = (key, label, extra = {}) => ({key, label, type: 'area', max: 4000, ...extra});
const url = (key, label) => ({key, label, type: 'url', max: 1000});
const list = (key, label, add, item) => ({key, label, type: 'list', add, item});
const pick = (key, label, choices, extra = {}) => ({key, label, type: 'select', choices, ...extra});

/** [màu chính, màu nền nhạt, tên] */
const COLORS = [['#5978d8', '#eaf0ff', 'Xanh dương'], ['#de9774', '#fff0e6', 'Cam'], ['#8a77be', '#f0ebff', 'Tím'], ['#4c9a8c', '#e6f5ef', 'Xanh ngọc'], ['#c9607f', '#fdeaf0', 'Hồng'], ['#b58a2a', '#fdf4dc', 'Vàng'], ['#4a8fbd', '#e5f3fb', 'Xanh trời'], ['#6b7294', '#eceef6', 'Xám']];
const ICONS = [['book', 'Sách'], ['network', 'Mạng'], ['globe', 'Web'], ['brain', 'Trí tuệ'], ['cpu', 'Vi xử lý'], ['file', 'Tài liệu'], ['compass', 'La bàn'], ['sprout', 'Cây'], ['trophy', 'Cúp']];
const majorChoices = () => majors.map(m => [m.id, `${m.id} · ${m.name}`]);
const nodeChoices = courseId => () => nodesOf(courseId).map(n => [n.id, n.title]);

export const SPECS = {
  course: {
    title: isNew => isNew ? 'Thêm môn học' : 'Sửa môn học',
    load: key => {
      const c = getCourse(key);
      return c ? {...c, majors: c.majors.map(m => ({...m}))} : {code: '', name: '', short: '', icon: 'book', color: COLORS[0][0], published: true, majors: []};
    },
    fields: () => [
      text('code', 'Mã môn', {required: true, max: 20, hint: 'Ví dụ: IT4062'}), text('name', 'Tên môn', {required: true, max: 120}),
      pick('icon', 'Biểu tượng', () => ICONS), pick('color', 'Màu', () => COLORS.map(([c, , name]) => [c, name])),
      {key: 'published', label: 'Hiển thị cho người dùng', type: 'check'},
      list('majors', 'Ngành học môn này', 'Thêm ngành', [pick('major', 'Ngành', majorChoices, {required: true}), pick('year', 'Năm', () => YEARS, {required: true, number: true})])
    ],
    save: data => ['saveCourse', {...data, soft: (COLORS.find(([c]) => c === data.color) || COLORS[0])[1]}]
  },
  node: {
    title: isNew => isNew ? 'Thêm Node' : 'Sửa Node',
    load: (key, courseId) => {
      const n = getNode(key);
      return n ? structuredClone(n) : {courseId, stage: 0, title: '', deps: [], summary: '', pitfall: '', flash: [], resources: []};
    },
    fields: (courseId, data) => [
      text('title', 'Tên Node', {required: true, max: 120}), pick('stage', 'Chặng', () => stages.map((s, i) => [i, s]), {number: true}),
      {key: 'deps', label: 'Phải thông suốt trước', type: 'checks', choices: () => nodesOf(courseId).filter(n => n.id !== data.id).map(n => [n.id, n.title])},
      area('summary', 'Tóm tắt khái niệm', {required: true}), area('pitfall', 'Cảnh báo bẫy', {max: 2000}),
      list('flash', 'Flash-check', 'Thêm câu hỏi', [area('q', 'Câu hỏi', {required: true, max: 1000}), area('a', 'Giải thích', {required: true, max: 2000})]),
      list('resources', 'Tài liệu (mục đầu tiên là tài liệu nên đọc trước)', 'Thêm tài liệu', [text('title', 'Tên', {required: true, max: 160}), {key: 'source', label: 'Liên kết hoặc tệp', type: 'source'}])
    ],
    save: data => ['saveNode', data]
  },
  lecturer: {
    title: isNew => isNew ? 'Thêm giảng viên' : 'Sửa giảng viên',
    load: (key, courseId) => structuredClone((lecturers[courseId] || []).find(l => l.id === key) || {kind: 'public', name: '', role: '', grading: [], sources: []}),
    fields: () => [
      text('name', 'Tên giảng viên', {required: true, max: 80}), text('role', 'Lớp, học phần', {max: 120}),
      pick('kind', 'Loại dữ liệu', () => [['public', 'Thông tin thật, có nguồn'], ['sample', 'Dữ liệu mẫu, hư cấu']]), text('asOf', 'Thời điểm thông tin', {hint: 'Ví dụ: Kỳ 2026.1'}),
      area('style', 'Tính cách', {max: 500, hint: 'Chỉ ghi điều có căn cứ, tôn trọng người được nhắc tới.'}), area('attendance', 'Điểm danh', {max: 500}), area('homework', 'Bài tập', {max: 500}), area('rules', 'Lưu ý', {max: 500}),
      list('grading', 'Thành phần điểm (tổng 100%)', 'Thêm thành phần', [text('label', 'Tên', {required: true, max: 60}), {key: 'weight', label: 'Phần trăm', type: 'number', min: 1, max: 100, required: true}]),
      area('gradingNote', 'Ghi chú cách chấm', {max: 600}), list('sources', 'Nguồn', 'Thêm nguồn', [text('title', 'Tên nguồn', {required: true}), url('url', 'Liên kết')])
    ],
    check: data => {
      const total = data.grading.reduce((sum, g) => sum + g.weight, 0);
      if (data.grading.length && total !== 100) throw Error(`Tổng phần trăm đang là ${total}, cần đúng 100.`);
    },
    save: (data, {key, courseId}) => ['saveItem', 'lecturer', courseId, key || '', data]
  },
  guide: {
    title: () => 'Bài tập lớn',
    load: (key, courseId) => structuredClone({scenario: '', outcome: '', project: [], deliverables: [], ...guides[courseId], reference: {title: '', description: '', links: [], ...guides[courseId]?.reference}}),
    fields: courseId => [
      text('scenario', 'Đề bài', {required: true, max: 300}), area('outcome', 'Kết quả cần đạt', {max: 1000}),
      list('project', 'Các bước', 'Thêm bước', [text('title', 'Tên bước', {required: true}), area('detail', 'Cách làm', {max: 1500}), text('output', 'Kết quả', {max: 300}), pick('node', 'Node liên quan', nodeChoices(courseId), {blank: 'Không gắn Node'})]),
      {key: 'deliverables', label: 'Cần kiểm tra trước khi nộp (mỗi dòng một mục)', type: 'lines'},
      {key: 'reference', label: 'Tham khảo', type: 'group', item: [text('title', 'Tiêu đề'), area('description', 'Mô tả', {max: 600}), list('links', 'Liên kết', 'Thêm liên kết', [text('title', 'Tên', {required: true}), url('url', 'Liên kết')])]}
    ],
    save: (data, {courseId}) => ['saveItem', 'guide', courseId, '', data]
  },
  exam: {
    title: (isNew, key) => key === 'mid' ? 'Ôn thi giữa kỳ' : 'Ôn thi cuối kỳ',
    load: (key, courseId) => { const e = exams[courseId]?.[key]; return structuredClone({papers: [], note: '', ...e, practice: {title: 'Đề tự luyện', time: '60 phút', questions: [], ...e?.practice}}); },
    fields: courseId => [
      list('papers', 'Đề các năm trước', 'Thêm đề', [text('title', 'Tên đề', {required: true}), text('detail', 'Mô tả ngắn'), url('url', 'Liên kết')]), area('note', 'Lưu ý về các đề', {max: 600}),
      {key: 'practice', label: 'Đề tự luyện', type: 'group', item: [text('title', 'Tên đề'), text('time', 'Thời gian', {max: 40}), list('questions', 'Câu hỏi', 'Thêm câu', [area('q', 'Câu hỏi', {required: true}), area('a', 'Đáp án', {required: true}), pick('node', 'Node liên quan', nodeChoices(courseId), {blank: 'Không gắn Node'})])]}
    ],
    save: (data, {key, courseId}) => ['saveItem', 'exam', courseId, key, data]
  }
};
