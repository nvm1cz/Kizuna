import test from 'node:test';
import assert from 'node:assert/strict';
import {nodes} from '../data.js';
import {isUnlocked, isMastered, missingPrereqs, nextStepTo, followers} from '../learning-path.js';

test('chỉ Node gốc mở khi chưa học gì', () => {
  for (const n of nodes) assert.equal(isUnlocked(n.id, {}), n.deps.length === 0, n.id);
});

test('Node chỉ mở khi MỌI Node tiên quyết đã thông suốt', () => {
  const progress = {'net-foundation': 'clear', 'net-tcp': 'clear'};
  assert.equal(isUnlocked('net-concurrency', progress), true);
  assert.equal(isUnlocked('net-framing', progress), false);
  assert.deepEqual(missingPrereqs('net-framing', progress).map(n => n.id), ['net-udp']);
  assert.equal(isUnlocked('net-framing', {...progress, 'net-udp': 'clear'}), true);
});

test('“Đang khám phá” và “Cần gỡ rối” không mở Node sau', () => {
  for (const status of ['explore', 'stuck']) assert.equal(isUnlocked('net-tcp', {'net-foundation': status}), false);
});

test('hạ trạng thái Node trước sẽ khóa lại cả nhánh phía sau', () => {
  const progress = {'net-foundation': 'stuck', 'net-tcp': 'clear'};
  assert.equal(isMastered('net-tcp', progress), false);
  assert.equal(isUnlocked('net-concurrency', progress), false);
});

test('luôn chỉ ra được bước học tiếp theo đang mở', () => {
  for (const n of nodes) assert.equal(isUnlocked(nextStepTo(n.id, {}).id, {}), true, n.id);
  assert.equal(nextStepTo('net-http', {}).id, 'net-foundation');
});

test('mọi Node đều học được nếu đi đúng thứ tự', () => {
  const progress = {};
  let open = [];
  do {
    open = nodes.filter(n => !progress[n.id] && isUnlocked(n.id, progress));
    open.forEach(n => { progress[n.id] = 'clear'; });
  } while (open.length);
  assert.equal(Object.keys(progress).length, nodes.length);
  assert.deepEqual(followers('net-practice'), []);
  assert.equal(isUnlocked('khong-co', progress), false);
});
