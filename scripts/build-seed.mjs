/** Sinh 03_seed.sql, 04_demo.sql và 05_demo_cleanup.sql từ supabase/seed/. Chạy: npm run seed */
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {demoCourses, demoPending, demoPeople, demoQuestions} from '../supabase/seed/demo.js';
import {seedContent} from '../supabase/seed/index.js';

const data = seedContent();
const q = v => v === null || v === undefined ? 'null' : `'${String(v).replaceAll("'", "''")}'`;
const json = v => `${q(JSON.stringify(v))}::jsonb`;
let out = [];
const insert = (table, columns, rows) => {
  if (rows.length) out.push(`insert into public.${table} (${columns}) values\n  ${rows.map(r => `(${r.join(', ')})`).join(',\n  ')}\non conflict do nothing;`);
};

// Node học trước phải được thêm trước Node phụ thuộc nó.
const ordered = [];
const visit = node => {
  if (ordered.includes(node)) return;
  node.deps.forEach(id => visit(data.nodes.find(n => n.id === id)));
  ordered.push(node);
};
data.nodes.forEach(visit);

insert('schools', 'id, name, sort', data.schools.map((s, i) => [q(s.id), q(s.name), i]));
insert('majors', 'id, school_id, name, sort', data.majors.map((m, i) => [q(m.id), q(m.schoolId), q(m.name), i]));
insert('courses', 'id, code, name, short, icon, color, soft', data.courses.map(c => [c.id, c.code, c.name, c.short, c.icon, c.color, c.soft].map(q)));
insert('course_majors', 'course_id, major_id, study_year', data.courses.flatMap(c => c.majors.map(m => [q(c.id), q(m.major), m.year])));
insert('nodes', 'id, course_id, stage, title, deps, summary, pitfall, flash, sort', ordered.map(n => [
  q(n.id), q(n.courseId), n.stage, q(n.title), n.deps.length ? `array[${n.deps.map(q).join(', ')}]` : `'{}'::text[]`, q(n.summary), q(n.pitfall), json(n.flash), data.nodes.indexOf(n)]));

// Các bảng dùng mã tự sinh: chỉ thêm khi môn chưa có dữ liệu, để chạy lại không bị nhân đôi.
const once = (table, columns, rows, guard) => out.push(`insert into public.${table} (${columns})\nselect * from (values\n  ${rows.map(r => `(${r.join(', ')})`).join(',\n  ')}\n) as v (${columns})\nwhere not exists (select 1 from public.${table} t where t.${guard} = v.${guard});`);
once('resources', 'node_id, title, url, sort', data.nodes.flatMap(n => n.resources.map((r, i) => [q(n.id), q(r.title), q(r.url), i])), 'node_id');
once('lecturers', 'course_id, data, sort', Object.entries(data.lecturers).flatMap(([id, list]) => list.map(({id: _, ...l}, i) => [q(id), json(l), i])), 'course_id');
insert('course_guides', 'course_id, data', Object.entries(data.guides).map(([id, g]) => [q(id), json(g)]));
insert('exams', 'course_id, term, data', Object.entries(data.exams).flatMap(([id, terms]) => Object.entries(terms).map(([term, e]) => [q(id), q(term), json(e)])));

function write(name, text) {
  fs.writeFileSync(fileURLToPath(new URL(`../supabase/${name}`, import.meta.url)), text);
  console.log(`Đã ghi supabase/${name}`);
}

write('03_seed.sql', `-- TỰ SINH bằng "npm run seed", không sửa tay. Nội dung khởi tạo: trường, ngành, 4 môn mẫu.
-- Chạy MỘT LẦN sau 02_hustree.sql. Không ghi đè nội dung admin đã sửa, nhưng sẽ thêm lại mục mẫu đã bị xóa.

${out.join('\n\n')}
`);

/* ---------- Dữ liệu mẫu ---------- */

/** Mã cố định theo tên, để chạy lại không bị nhân đôi. */
const uuid = name => {
  const h = createHash('md5').update('hustree-demo:' + name).digest('hex');
  return q(`${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20)}`);
};
const person = i => uuid(`person-${i}`);
const nodes = demoCourses.flatMap(c => c.nodes.map(([slug, stage, title, deps, summary, pitfall, ask, answer, resTitle, url], i) => ({
  id: `${c.id}-${slug}`, courseId: c.id, stage, title, deps: deps.map(d => `${c.id}-${d}`), summary, pitfall, ask, answer, resTitle, url, sort: i})));
const exam = list => ({papers: [], note: '', practice: {title: 'Đề tự luyện (mẫu)', time: '30 phút', questions: list.map(n => ({q: n.ask, a: n.answer, node: n.id}))}});
const approved = demoPeople.flatMap(([,,, count], i) => Array.from({length: count}, (_, k) => ({i, k}))).map((x, j) => ({...x, node: nodes[j % nodes.length]}));

out = [];
insert('courses', 'id, code, name, icon, color, soft', demoCourses.map(c => [c.id, c.code, c.name, c.icon, c.color, c.soft].map(q)));
insert('course_majors', 'course_id, major_id, study_year', demoCourses.flatMap(c => c.majors.map(m => [q(c.id), q(m), c.year])));
for (const stage of [0, 1, 2, 3]) insert('nodes', 'id, course_id, stage, title, deps, summary, pitfall, flash, sort', nodes.filter(n => n.stage === stage).map(n => [
  q(n.id), q(n.courseId), n.stage, q(n.title), n.deps.length ? `array[${n.deps.map(q).join(', ')}]` : "'{}'::text[]", q(n.summary), q(n.pitfall), json([{q: n.ask, a: n.answer}]), n.sort]));
insert('resources', 'id, node_id, title, url, sort', nodes.map(n => [uuid('resource-' + n.id), q(n.id), q(n.resTitle), q(n.url), 0]));
insert('lecturers', 'id, course_id, data, sort', demoCourses.map(c => [uuid('lecturer-' + c.id), q(c.id), json({kind: 'sample', name: 'Giảng viên mẫu', role: c.name, style: 'Thân thiện, hay hỏi bài.', attendance: 'Điểm danh ngẫu nhiên 4 buổi.', homework: 'Bài tập hằng tuần.', rules: 'Nộp trễ trừ điểm.', grading: [{label: 'Quá trình', weight: 40}, {label: 'Cuối kỳ', weight: 60}], gradingNote: 'Dữ liệu hư cấu để xem thử giao diện.', sources: []}), 0]));
insert('exams', 'course_id, term, data', demoCourses.flatMap(c => { const own = nodes.filter(n => n.courseId === c.id); return [[q(c.id), q('mid'), json(exam(own.slice(0, 3)))], [q(c.id), q('final'), json(exam(own.slice(-3)))]]; }));
const courseSql = out.join('\n\n');

out = [];
insert('questions', 'id, node_id, course_id, alias, title, body, demo, created_at', demoQuestions.map(([node, alias, title, body], i) => [q('mau-' + (i + 1)), q(node), q(node.split('-')[0]), q(alias), q(title), q(body), 'true', `now() - interval '${(i + 1) * 9} hours'`]));
insert('replies', 'id, question_id, body, alias, created_at', demoQuestions.flatMap(([,,,, reply], i) => reply ? [[q('mau-tl-' + (i + 1)), q('mau-' + (i + 1)), q(reply), q('Cáo Nhỏ Kiên Trì'), `now() - interval '${(i + 1) * 8} hours'`]] : []));
const askSql = out.join('\n\n');

out = [];
out.push(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change) values
  ${demoPeople.map((_, i) => `('00000000-0000-0000-0000-000000000000', ${person(i)}, 'authenticated', 'authenticated', 'mau-${i + 1}@demo.hustree.invalid', '', now(), now(), '{"provider":"email","providers":["email"]}', '{}', '', '', '', '')`).join(',\n  ')}
on conflict do nothing;`);
insert('profiles', 'user_id, display_name, major_id, study_year', demoPeople.map(([name, major, year], i) => [person(i), q(name), q(major), year]));
out[out.length - 1] = out.at(-1).replace('on conflict do nothing;', 'on conflict (user_id) do update set display_name = excluded.display_name;');
out.push('-- Tài liệu đã duyệt: tắt thông báo để admin không nhận hàng chục tin cũ.\nalter table public.contributions disable trigger on_contribution;');
insert('contributions', 'id, user_id, node_id, title, url, status, created_at, reviewed_at', approved.map(({i, k, node}) => [uuid(`approved-${i}-${k}`), person(i), q(node.id), q(node.resTitle), q(node.url), q('approved'), `now() - interval '${k * 5 + 1} days'`, `now() - interval '${k * 5} days'`]));
out.push('alter table public.contributions enable trigger on_contribution;');
out.push(`update public.resources r set contributor_id = v.person::uuid from (values\n  ${[...new Map(approved.map(a => [a.node.id, a])).values()].map(a => `(${uuid('resource-' + a.node.id)}, ${person(a.i)})`).join(',\n  ')}\n) as v (id, person) where r.id = v.id::uuid and r.contributor_id is null;`);
out.push('-- Tài liệu chờ duyệt: admin sẽ nhận thông báo.');
insert('contributions', 'id, user_id, node_id, title, note, url', demoPending.map(([i, node, title, note, url], k) => [uuid('pending-' + k), person(i), q(node), q(title), q(note), q(url)]));
const peopleSql = out.join('\n\n');

write('04_demo.sql', `-- DỮ LIỆU MẪU để xem thử. TỰ SINH bằng "npm run seed", không sửa tay.
-- Chạy sau 03_seed.sql. Chạy lại không bị nhân đôi. Xóa bằng 05_demo_cleanup.sql.
-- Người đóng góp là hư cấu, email @demo.hustree.invalid, chưa có mật khẩu. Nội dung học do AI soạn, cần nhóm kiểm tra.

-- 1. Bảy môn mẫu
${courseSql}

-- 2. Câu hỏi và phản hồi mẫu
${askSql}

-- 3. Người đóng góp, bảng xếp hạng, tài liệu chờ duyệt
${peopleSql}
`);
write('05_demo_cleanup.sql', `-- XÓA DỮ LIỆU MẪU của 04_demo.sql. TỰ SINH bằng "npm run seed".

-- 1. Người đóng góp mẫu, bài đã gửi, câu hỏi mẫu. Không đụng tới người dùng thật.
delete from auth.users where email like '%@demo.hustree.invalid';
delete from public.questions where id like 'mau-%' and demo;

-- 2. Bảy môn mẫu cùng Node, tài liệu, đề thi, kể cả phần admin đã sửa hoặc người dùng đã đóng góp vào đó.
--    Chỉ bỏ dấu -- ở dòng dưới khi chắc chắn muốn xóa.
-- delete from public.courses where id in (${demoCourses.map(c => q(c.id)).join(', ')});
`);
