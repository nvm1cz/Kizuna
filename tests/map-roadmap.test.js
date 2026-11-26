import test from 'node:test';
import assert from 'node:assert/strict';
import {nodes, courses} from '../public/js/core/catalog.js';
import {boot, user} from './helpers.js';

test('bản đồ giữ 4 chặng, khóa Node theo tiên quyết và mở dần khi thông suốt', async () => {
  const {app, go, click, backend, settle} = await boot('#/course/network', {user});
  for (const c of courses) {
    go('#/course/' + c.id);
    const own = nodes.filter(n => n.courseId === c.id), roots = own.filter(n => !n.deps.length);
    assert.equal((app.innerHTML.match(/class="map-stage"/g) || []).length, 4, c.id);
    assert.equal((app.innerHTML.match(/data-map-node="/g) || []).length, own.length, c.id);
    assert.equal((app.innerHTML.match(/map-card status-locked/g) || []).length, own.length - roots.length, c.id);
  }

  assert.doesNotMatch(app.innerHTML, /Cần: |map-legend|Nội dung mang tính tham khảo/);

  go('#/node/net-tcp');
  assert.match(app.innerHTML, /locked-page/);
  assert.doesNotMatch(app.innerHTML, /class="node-step"/);
  click({action: 'set-status', id: 'net-tcp', status: 'clear'});
  await settle();
  assert.equal(backend.remote.progress['net-tcp'], undefined, 'không đánh dấu được Node đang khóa');

  go('#/node/net-foundation');
  click({action: 'set-status', id: 'net-foundation', status: 'clear'});
  assert.match(app.innerHTML, /class="unlock"/);
  await settle();
  assert.equal(backend.remote.progress['net-foundation'], 'clear', 'tiến độ được đẩy lên máy chủ');
  go('#/course/network');
  assert.match(app.innerHTML, /class="map-card status-clear"[^>]+data-map-node="net-foundation"/);
  assert.match(app.innerHTML, /class="map-card status-open"[^>]+data-map-node="net-tcp"/);
  assert.match(app.innerHTML, /class="map-card status-locked"[^>]+data-map-node="net-framing"/);

  go('#/node/net-foundation');
  click({action: 'set-status', id: 'net-foundation', status: 'stuck'});
  go('#/course/network');
  assert.match(app.innerHTML, /class="map-card status-locked"[^>]+data-map-node="net-tcp"/);
});
