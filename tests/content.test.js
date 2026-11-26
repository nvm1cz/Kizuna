import test from 'node:test';
import assert from 'node:assert/strict';
import {courses, exams, examTerms, getNode, guides as courseGuides, lecturers, majors, nodes, schools, setCatalog} from '../public/js/core/catalog.js';
import {seedContent} from '../supabase/seed/index.js';

setCatalog(seedContent());

const https = url => assert.equal(new URL(url).protocol, 'https:');

test('bản đồ 4 môn đầy đủ và không có vòng lặp tiên quyết', () => {
  assert.equal(courses.length, 4);
  assert.equal(new Set(nodes.map(n => n.id)).size, nodes.length);
  for (const n of nodes) {
    assert.match(n.id, /^[a-z0-9-]{1,60}$/, 'mã Node phải khớp ràng buộc trong supabase');
    assert.ok(n.summary.length > 25 && n.pitfall.length > 15 && n.flash.length && n.resources.length, n.id);
    for (const dep of n.deps) {
      assert.equal(getNode(dep)?.courseId, n.courseId);
      assert.ok(getNode(dep).stage <= n.stage);
    }
  }
  const trail = [];
  const visit = id => {
    assert.ok(!trail.includes(id), 'vòng lặp: ' + trail.join(' > '));
    trail.push(id);
    getNode(id).deps.forEach(visit);
    trail.pop();
  };
  nodes.forEach(n => visit(n.id));
});

test('trường, ngành và môn của ngành hợp lệ', () => {
  assert.equal(majors.length, 68);
  assert.equal(new Set(majors.map(m => m.id)).size, 68);
  for (const m of majors) {
    assert.match(m.id, /^[A-Z0-9-]{2,12}$/);
    assert.ok(schools.some(s => s.id === m.schoolId), m.id);
  }
  for (const c of courses) for (const {major, year} of c.majors) assert.ok(majors.some(m => m.id === major) && year >= 1 && year <= 6, `${c.id} ${major}`);
});

test('mỗi môn có giảng viên với cách chấm hợp lệ', () => {
  for (const c of courses) {
    assert.ok(lecturers[c.id].length >= 2, c.id);
    for (const l of lecturers[c.id]) {
      assert.ok(l.name && l.gradingNote, l.id);
      if (l.grading.length) assert.equal(l.grading.reduce((sum, g) => sum + g.weight, 0), 100, l.id);
    }
  }
});

test('giảng viên thật luôn có nguồn; nhân vật mẫu không mang tên người thật', () => {
  for (const l of Object.values(lecturers).flat()) {
    if (l.kind === 'public') {
      assert.ok(l.sources.length && l.asOf, l.id);
      l.sources.forEach(s => https(s.url));
    } else {
      assert.equal(l.kind, 'sample');
      assert.match(l.name, /^Giảng viên [A-Z]$/);
    }
  }
});

test('mỗi môn có phần ôn thi giữa kỳ và cuối kỳ', () => {
  for (const c of courses) for (const [term] of examTerms) {
    const set = exams[c.id][term];
    set.papers.forEach(p => { assert.ok(p.title); https(p.url); });
    assert.ok(set.practice.questions.length >= 4, `${c.id} ${term}`);
    for (const item of set.practice.questions) {
      assert.ok(item.q && item.a);
      assert.equal(getNode(item.node)?.courseId, c.id, item.q);
    }
  }
  assert.ok(exams.network.mid.papers.length && exams.network.final.papers.length);
});

test('các bước bài tập lớn trỏ đúng Node của môn', () => {
  for (const c of courses) for (const s of courseGuides[c.id].project) assert.equal(getNode(s.node)?.courseId, c.id);
});
