import test from 'node:test';
import assert from 'node:assert/strict';
import {courseEvidence} from '../course-evidence.js';
import {courses} from '../data.js';

test('every course has compact evidence for lectures, lecturer, grading and exams',()=>{
 assert.equal(courses.length,4);
 for(const course of courses){
  const e=courseEvidence[course.id];assert.ok(e,course.id);
  for(const section of ['lectures','requirements','grading','tests']){
   assert.ok(Array.isArray(e[section])&&e[section].length>=2,`${course.id} ${section}`);
   for(const item of e[section]){
    assert.ok(item.title&&((item.detail||item.desc)||'').length>15);
    if(item.url){const u=new URL(item.url);assert.equal(u.protocol,'https:');}
   }
  }
  assert.ok(/hiện tại|hiện hành|2026\.1/.test(e.note),course.id);
 }
 assert.equal(courses.find(c=>c.id==='web').code,'IT4409');
 assert.equal(courses.find(c=>c.id==='ml').code,'IT3190');
 assert.equal(courses.find(c=>c.id==='iot').code,'IT4735');
});

test('historic grading is attributed; unverified classes have no fabricated scores',()=>{
 assert.match(courseEvidence.network.grading[0].period,/trước đây/);
 assert.match(courseEvidence.ml.grading[0].period,/2025/);
 for(const id of ['web','iot']){
  assert.match(courseEvidence[id].grading[0].title,/Chưa/);
  assert.doesNotMatch(courseEvidence[id].grading.map(x=>x.title+' '+x.detail).join(' '),/\b[0-9]{1,2}%/);
 }
});
