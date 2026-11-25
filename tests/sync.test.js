import test from 'node:test';
import assert from 'node:assert/strict';
import {fakeBackend, fakeBrowser, user} from './helpers.js';

const legacy = JSON.stringify({device: 'x', progress: {'net-foundation': 'clear', 'khong-co': 'clear', 'net-tcp': 'sai'}, answers: {'net-foundation': [0]}});
fakeBrowser('#/home', {stored: {'kizuna-mvp-state-v1': legacy}});
const {local, openAccount, closeAccount} = await import('../public/js/core/store.js');
const {createSync} = await import('../public/js/services/sync.js');

test('chuyển tiến độ cũ trên máy vào tài khoản trống, đúng một lần', async () => {
  const backend = fakeBackend();
  openAccount(user.id);
  assert.equal(await createSync(backend).pull(), true);
  assert.deepEqual(backend.remote.progress, {'net-foundation': 'clear'}, 'bỏ Node và trạng thái không hợp lệ');
  assert.equal(localStorage.getItem('kizuna-mvp-state-v1'), null);
  closeAccount();
  openAccount('khac');
  assert.equal(await createSync(fakeBackend()).pull(), false);
  assert.deepEqual(local.progress, {});
  closeAccount();
});

test('tài khoản đã có tiến độ thì không bị tiến độ cũ ghi đè', async () => {
  localStorage.setItem('kizuna-mvp-state-v1', legacy);
  const backend = fakeBackend({remote: {progress: {'web-html': 'stuck'}}});
  openAccount(user.id);
  assert.equal(await createSync(backend).pull(), false);
  assert.deepEqual(local.progress, {'web-html': 'stuck'});
  closeAccount();
});

test('lỗi mạng giữ thay đổi để gửi lại, kể cả thay đổi thêm trong lúc đang gửi', async () => {
  const backend = fakeBackend(), failed = [];
  openAccount(user.id);
  const sync = createSync(backend, e => failed.push(e));
  backend.offline = true;
  local.progress['net-foundation'] = 'clear';
  sync.nodeChanged('net-foundation');
  await new Promise(r => setTimeout(r, 5));
  assert.equal(failed.length, 1);
  assert.deepEqual(local.dirtyNodes, ['net-foundation']);
  closeAccount();
  assert.match(localStorage.getItem('kizuna-cache-v2:' + user.id), /net-foundation/, 'chưa lưu xong thì không xóa bản trên máy');

  openAccount(user.id);
  backend.offline = false;
  const save = backend.saveProgress;
  backend.saveProgress = async (...args) => {
    backend.saveProgress = save;
    local.progress['net-tcp'] = 'explore';
    sync.nodeChanged('net-tcp');
    await save(...args);
  };
  await sync.flush();
  assert.deepEqual(backend.remote.progress, {'net-foundation': 'clear', 'net-tcp': 'explore'});
  assert.deepEqual(local.dirtyNodes, []);
});
