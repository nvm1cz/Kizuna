import test from 'node:test';
import assert from 'node:assert/strict';
import {boot} from './helpers.js';

test('trang môn học, giảng viên, ôn thi và Node hiển thị đúng phần', async () => {
  const {app, go, click} = await boot('#/course/network');
  for (const tab of ['Bản đồ kiến thức', 'Bài tập lớn', 'Giảng viên & chấm điểm', 'Ôn thi']) assert.ok(app.innerHTML.includes(tab), tab);
  assert.doesNotMatch(app.innerHTML, />Kiểm tra</);

  go('#/course/network/project');
  assert.match(app.innerHTML, /Xây dựng một chatroom TCP/);

  go('#/course/network/lecturers');
  for (const label of ['Cách chấm điểm', 'Tính cách', 'Điểm danh', 'Dữ liệu mẫu', 'Bùi Trọng Tùng']) assert.ok(app.innerHTML.includes(label), label);
  assert.doesNotMatch(app.innerHTML, /<form|lecturer-review/, 'người dùng không nhập review');

  go('#/course/network/exams');
  assert.match(app.innerHTML, /Giữa kỳ 20121/);
  assert.doesNotMatch(app.innerHTML, /Cuối kỳ 20132/);
  click({action: 'exam-term', term: 'final'});
  assert.match(app.innerHTML, /Cuối kỳ 20132/);
  assert.doesNotMatch(app.innerHTML, /class="answer"/);
  click({action: 'exam-answer', key: 'network:final:0'});
  assert.match(app.innerHTML, /class="answer"/);
  go('#/course/iot/exams');
  assert.match(app.innerHTML, /Chưa có đề cuối kỳ các năm trước/);

  go('#/node/net-foundation');
  for (const heading of ['Tóm tắt khái niệm', 'Tài liệu chọn lọc', 'Cảnh báo bẫy', 'Flash-check', 'Hỏi đáp', 'Tự đánh giá']) assert.ok(app.innerHTML.includes(heading), heading);
  assert.equal((app.innerHTML.match(/class="node-step"/g) || []).length, 6);

  const routes = [['#/home', 'Chọn môn học'], ['#/courses', 'Chọn môn học'], ['#/my', 'Của tôi'], ['#/help', 'Góp ý cho nhóm'], ['#/node/sai', 'Không tìm thấy trang'], ['#/constructor', 'Không tìm thấy trang']];
  for (const [hash, text] of routes) {
    go(hash);
    assert.ok(app.innerHTML.includes(text), hash);
  }
});
