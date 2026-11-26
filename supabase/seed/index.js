/** Gom dữ liệu khởi tạo, cùng hình dạng với kết quả của hàm load_content() trong database. */
import {courses, nodes} from './courses.js';
import {lecturers} from './lecturers.js';
import {exams} from './exams.js';
import {courseGuides} from './project-guides.js';
import {schools, majors, courseMajors} from './programs.js';

export const seedContent = () => structuredClone({
  schools: schools.map(([id, name]) => ({id, name})),
  majors,
  courses: courses.map(({id, code, name, short, icon, color, soft}) => ({
    id, code, name, short, icon, color, soft, published: true,
    majors: (courseMajors[id] || []).map(([major, year]) => ({major, year}))
  })),
  nodes: nodes.map(({id, courseId, stage, title, deps, summary, pitfall, flash, resources}) => ({
    id, courseId, stage, title, deps, summary, pitfall, flash,
    resources: resources.map((r, i) => ({id: `${id}-r${i}`, title: r.title, url: r.url, filePath: null, by: null}))
  })),
  lecturers, exams, guides: courseGuides
});
