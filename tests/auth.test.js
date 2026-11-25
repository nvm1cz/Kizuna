import test from 'node:test';
import assert from 'node:assert/strict';
import {boot, user} from './helpers.js';

const other = {id: '00000000-0000-4000-8000-000000000002', email: 'binh@example.com'};

test('bắt buộc đăng nhập, đăng ký, quên mật khẩu, đổi tài khoản', async () => {
  const errorBox = {textContent: '', hidden: true};
  const remote = {progress: {'net-foundation': 'clear'}};
  const {app, store, backend, go, click, submit, settle} = await boot('#/course/network', {remote, elements: {'auth-error': errorBox}});

  // Chưa đăng nhập: mọi đường dẫn đều ra trang đăng nhập.
  for (const hash of ['#/home', '#/course/network', '#/node/net-foundation', '#/community', '#/help']) {
    go(hash);
    assert.match(app.innerHTML, /id="auth-form"/, hash);
    assert.doesNotMatch(app.innerHTML, /map-card|class="question"|node-step/, hash);
  }

  // Đăng ký: kiểm tra mật khẩu trước khi gọi máy chủ.
  click({action: 'auth-mode', mode: 'signup'});
  assert.match(app.innerHTML, /Tạo tài khoản/);
  await submit('auth-form', {email: 'x@y.z', password: 'ngan', confirm: 'ngan'});
  assert.match(errorBox.textContent, /ít nhất 8/);
  await submit('auth-form', {email: 'x@y.z', password: 'matkhau12', confirm: 'matkhau13'});
  assert.match(errorBox.textContent, /chưa giống nhau/);
  assert.equal(backend.calls.length, 0);
  await submit('auth-form', {email: ' <X>@Y.z ', password: 'matkhau12', confirm: 'matkhau12'});
  assert.deepEqual(backend.calls.at(-1), ['signUp', '<x>@y.z', 'matkhau12']);
  assert.match(app.innerHTML, /Xác nhận email[\s\S]*&lt;x&gt;@y\.z/);

  // Quên mật khẩu không tiết lộ email có tồn tại hay không.
  click({action: 'auth-mode', mode: 'forgot'});
  await submit('auth-form', {email: 'a@b.c'});
  assert.match(app.innerHTML, /Nếu email này có tài khoản/);

  // Sai mật khẩu, rồi đúng: vào thẳng trang đang muốn xem, tiến độ lấy từ máy chủ.
  go('#/course/network');
  await submit('auth-form', {email: 'sai@x.y', password: 'matkhau12'});
  assert.match(errorBox.textContent, /không đúng/);
  await submit('auth-form', {email: user.email, password: 'matkhau12'});
  assert.match(app.innerHTML, /class="map-card status-clear"[^>]+data-map-node="net-foundation"/);
  assert.match(app.innerHTML, /an@example\.com/);

  // Quay lại tab làm Supabase phát SIGNED_IN lần nữa: không được tải lại trang.
  const before = app.innerHTML;
  backend.emit('SIGNED_IN', user);
  assert.equal(app.innerHTML, before);

  // Đăng xuất sạch: người sau trên cùng máy không thấy tiến độ của người trước.
  click({action: 'sign-out'});
  await settle();
  assert.match(app.innerHTML, /id="auth-form"/);
  assert.doesNotMatch(app.innerHTML, /an@example\.com/);
  assert.equal([...store.keys()].some(k => k.includes(user.id)), false);
  backend.remote = {progress: {}, answers: {}, guideChecks: {}};
  backend.emit('SIGNED_IN', other);
  await settle();
  assert.match(app.innerHTML, /binh@example\.com/);
  assert.doesNotMatch(app.innerHTML, /status-clear/);

  // Mất mạng: thay đổi vẫn giữ trên máy và được gửi khi đăng nhập lại.
  backend.offline = true;
  go('#/node/net-foundation');
  click({action: 'set-status', id: 'net-foundation', status: 'explore'});
  await settle();
  assert.match(store.get('kizuna-cache-v2:' + other.id), /"dirtyNodes":\["net-foundation"\]/);
  backend.emit('SIGNED_OUT', null);
  backend.offline = false;
  backend.emit('SIGNED_IN', other);
  await settle();
  assert.equal(backend.remote.progress['net-foundation'], 'explore');

  // Đặt lại mật khẩu từ email.
  backend.emit('SIGNED_OUT', null);
  backend.emit('PASSWORD_RECOVERY', other);
  assert.match(app.innerHTML, /Đặt mật khẩu mới/);
  await submit('auth-form', {password: 'matkhaumoi1', confirm: 'matkhaumoi1'});
  assert.deepEqual(backend.calls.at(-1), ['setPassword', 'matkhaumoi1']);
  assert.match(app.innerHTML, /binh@example\.com/);
});
