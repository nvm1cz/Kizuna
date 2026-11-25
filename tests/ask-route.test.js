import test from 'node:test';
import assert from 'node:assert/strict';
import {boot, user} from './helpers.js';

test('đặt câu hỏi tại chỗ, không bắt buộc chọn môn hay chủ đề', async () => {
  const topic = {innerHTML: '', disabled: true};
  const {app, handlers, backend, go, click, submit} = await boot('#/community', {user, elements: {'ask-node': topic}});
  const asked = () => backend.calls.filter(c => c[0] === 'ask').map(c => c[1]);

  assert.match(app.innerHTML, /data-action="ask">.*?Đặt câu hỏi mới/);
  click({action: 'ask'});
  assert.equal(location.hash, '#/community');
  assert.match(app.innerHTML, /Đặt câu hỏi ẩn danh/);
  assert.doesNotMatch(app.innerHTML, /id="ask-(body|title|course)"[^>]*(required|minlength)/);

  handlers.change({target: {id: 'ask-course', value: 'network', matches: () => false}});
  assert.equal(topic.disabled, false);
  assert.match(topic.innerHTML, /net-tcp/);

  await submit('ask-form', {nodeId: 'net-tcp', title: 'Vì sao recv không nhận đủ dữ liệu?', body: 'Chi tiết'});
  assert.deepEqual(asked()[0], {nodeId: 'net-tcp', courseId: 'network', title: 'Vì sao recv không nhận đủ dữ liệu?', body: 'Chi tiết'});
  assert.match(app.innerHTML, /Vì sao recv không nhận đủ dữ liệu\?/);

  click({action: 'ask'});
  await submit('ask-form', {});
  assert.deepEqual(asked()[1], {nodeId: '', courseId: '', title: '', body: ''});
  assert.match(app.innerHTML, /Câu hỏi chưa có tiêu đề/);

  go('#/node/net-foundation');
  click({action: 'ask', node: 'net-foundation'});
  assert.match(app.innerHTML, /name="nodeId" value="net-foundation"/);
  assert.doesNotMatch(app.innerHTML, /id="ask-course"/);
});
