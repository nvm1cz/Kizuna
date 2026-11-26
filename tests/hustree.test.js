import test from 'node:test';
import assert from 'node:assert/strict';
import {boot, user} from './helpers.js';

const draftForm = {};
const reply = {id: 7, kind: 'reply', title: 'Câu hỏi của bạn có phản hồi mới', body: '<i>TCP</i>', link: 'community/q0', read: false, createdAt: new Date().toISOString()};

test('chọn ngành lần đầu, môn theo năm, đóng góp, thông báo và quản trị', async () => {
  const env = await boot('#/home', {
    user, me: {role: 'user', displayName: null, majorId: null, studyYear: null, points: 0},
    notices: {unread: 1, items: [reply]}, questions: [{id: 'q0', nodeId: 'net-tcp', courseId: 'network', title: 'Hỏi TCP', body: '', alias: 'Mèo', createdAt: reply.createdAt, empathyCount: 0}],
    pending: [{id: 'c1', nodeId: 'net-tcp', title: 'Ghi chú', note: '<b>hay</b>', url: 'javascript:alert(1)', filePath: null, by: 'An', createdAt: reply.createdAt}],
    elements: {'editor-form': draftForm}
  });
  const {app, backend, go, click, submit, settle} = env;

  // Lần đầu: bắt buộc chọn ngành trước khi vào.
  assert.match(app.innerHTML, /Bạn đang học gì\?/);
  go('#/course/network');
  assert.match(app.innerHTML, /Bạn đang học gì\?/);
  assert.doesNotMatch(app.innerHTML, /map-card/);
  go('#/home');
  await submit('profile-form', {major: 'IT1', year: '3', name: ' An '});
  assert.deepEqual(backend.calls.find(c => c[0] === 'saveProfile')[1], {name: 'An', major: 'IT1', year: 3});

  // Môn đúng ngành, đúng năm; chuyển phạm vi; tìm kiếm quét tất cả.
  const cards = () => [...app.innerHTML.matchAll(/course-code">(\w+)/g)].map(m => m[1]).sort();
  assert.deepEqual(cards(), ['IT3190']);
  click({action: 'course-scope', scope: 'major'});
  assert.deepEqual(cards(), ['IT3190', 'IT4062', 'IT4409', 'IT4735']);
  backend.profile.majorId = 'EM1';
  await submit('profile-form', {major: 'EM1', year: '1', name: 'An'});
  go('#/home');
  assert.match(app.innerHTML, /Chưa có môn cho lựa chọn này/);
  click({action: 'course-scope', scope: 'all'});
  assert.equal(cards().length, 4);

  // Người thường không vào được trang quản trị.
  assert.doesNotMatch(app.innerHTML, /Quản trị/);

  // Thông báo.
  assert.match(app.innerHTML, /1 chưa đọc/);
  assert.match(app.innerHTML, /&lt;i&gt;TCP/);
  click({action: 'open-notice', id: '7', link: 'community/q0'});
  await settle();
  assert.deepEqual(backend.calls.find(c => c[0] === 'readNotifications')[1], [7]);
  assert.equal(location.hash, '#/community/q0');
  go('#/community/q0');
  assert.match(app.innerHTML, /question is-focus" id="q-q0"/);

  // Đóng góp.
  go('#/contribute/send/net-tcp');
  assert.match(app.innerHTML, /<option value="net-tcp" selected>/);
  await submit('contribute-form', {nodeId: 'net-tcp', title: 'Slide', kind: 'link', url: 'javascript:alert(1)'});
  assert.equal(backend.calls.some(c => c[0] === 'submitContribution'), false, 'chặn liên kết không phải http');
  await submit('contribute-form', {nodeId: 'net-tcp', title: 'Slide', kind: 'file', file: {name: 'a.pdf', size: 9}});
  assert.deepEqual(backend.calls.find(c => c[0] === 'submitContribution')[1], {nodeId: 'net-tcp', title: 'Slide', note: '', filePath: `${user.id}/a.pdf`});
  for (const hash of ['#/home', '#/course/network', '#/node/net-foundation', '#/community', '#/contribute', '#/profile', '#/help']) {
    go(hash);
    assert.match(app.innerHTML, /id="ranking"[\s\S]*Bình &lt;b&gt;/, hash);
  }

  click({action: 'toggle-ranking'});
  go('#/home');
  assert.match(app.innerHTML, /layout is-collapsed[\s\S]*ranking-open/, 'thu gọn được nhớ khi sang trang khác');
  click({action: 'toggle-ranking'});
  go('#/contribute/ranking');
  assert.doesNotMatch(app.innerHTML, /<aside class="ranking"/, 'tab riêng thì ẩn cột bên phải');
  assert.equal((app.innerHTML.match(/id="ranking"/g) || []).length, 1);
  assert.match(app.innerHTML, /ranking-page[\s\S]*>Tháng<[\s\S]*Bình &lt;b&gt;/);

  // Quản trị viên.
  click({action: 'sign-out'});
  await settle();
  backend.profile = {role: 'admin', displayName: 'Sếp', majorId: 'IT1', studyYear: 4, points: 0};
  go('#/admin/review');
  backend.emit('SIGNED_IN', user);
  await settle();
  assert.match(app.innerHTML, /Duyệt và đăng/);
  assert.match(app.innerHTML, /&lt;b&gt;hay/);
  assert.doesNotMatch(app.innerHTML, /href="javascript:/);
  await submit('', {decision: 'approve', nodeId: 'net-udp', title: 'Tên mới'}, {form: 'review', id: 'c1'});
  assert.deepEqual(backend.calls.find(c => c[0] === 'review')[1], {id: 'c1', approve: true, nodeId: 'net-udp', title: 'Tên mới', reason: ''});

  // Sửa giảng viên: danh sách con và kiểm tra tổng phần trăm.
  go('#/admin/content/network');
  assert.match(app.innerHTML, /Thêm Node[\s\S]*Bùi Trọng Tùng/);
  click({action: 'edit', kind: 'lecturer'});
  const typed = {name: 'Thầy A', kind: 'public', 'grading.0.label': 'Giữa kỳ', 'grading.0.weight': '40', 'grading.1.label': 'Cuối kỳ', 'grading.1.weight': '50'};
  globalThis.FormData = class { get(k) { return typed[k] ?? ''; } getAll() { return []; } };
  click({action: 'list-add', path: 'grading'});
  click({action: 'list-add', path: 'grading'});
  assert.match(app.innerHTML, /name="name"[^>]*value="Thầy A"/, 'thêm dòng không làm mất chữ đang gõ');
  await submit('editor-form', typed);
  assert.equal(backend.calls.some(c => c[0] === 'saveItem'), false, 'tổng 90% thì không lưu');
  typed['grading.1.weight'] = '60';
  await submit('editor-form', typed);
  const saved = backend.calls.find(c => c[0] === 'saveItem');
  assert.deepEqual(saved.slice(1, 4), ['lecturer', 'network', '']);
  assert.deepEqual(saved[4].grading, [{label: 'Giữa kỳ', weight: 40}, {label: 'Cuối kỳ', weight: 60}]);

  // Thêm Node: tài liệu phải có nguồn hợp lệ.
  click({action: 'edit', kind: 'node'});
  globalThis.FormData = class { get(k) { return k === 'title' ? 'Node mới' : ''; } getAll() { return []; } };
  click({action: 'list-add', path: 'resources'});
  await submit('editor-form', {title: 'Node mới', stage: '1', deps: ['net-tcp'], summary: 's', pitfall: '', 'resources.0.title': 'TL', 'resources.0.url': 'ftp://x'});
  assert.equal(backend.calls.some(c => c[0] === 'saveNode'), false);
  await submit('editor-form', {title: 'Node mới', stage: '1', deps: ['net-tcp'], summary: 's', pitfall: '', 'resources.0.title': 'TL', 'resources.0.url': 'https://x.y'});
  const node = backend.calls.find(c => c[0] === 'saveNode')[1];
  assert.deepEqual([node.courseId, node.stage, node.deps, node.resources], ['network', 1, ['net-tcp'], [{title: 'TL', url: 'https://x.y'}]]);
});
