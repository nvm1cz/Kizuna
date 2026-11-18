import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,nodes} from '../data.js';
import {courseGuides} from '../learning-guides.js';
import {answerQuestion,suggestedPrompts} from '../assistant.js';

test('four course guides contain actionable projects linked to map nodes',()=>{
 for(const c of courses){const g=courseGuides[c.id];assert.ok(g,'missing '+c.id);assert.ok(g.project.length>=4);assert.ok(g.assessment.length>=3);assert.ok(g.lecturer.length>=2);assert.ok(g.deliverables.length>=4);for(const step of g.project)assert.ok(nodes.some(n=>n.id===step.node&&n.courseId===c.id),'missing course node '+step.node);}
});
test('guided chatbot gives course-specific, labeled demo plans without inventing grading',()=>{
 for(const course of courses){const a=answerQuestion('Hướng dẫn làm bài tập lớn môn '+course.name,{courseId:course.id});assert.equal(a.matched,true);assert.equal(a.guideSection,'project');assert.equal(a.courseId,course.id);assert.ok(a.text.includes('ví dụ minh họa'));}
 const exam=answerQuestion('Cấu trúc thi môn học máy là gì?',{courseId:'ml'});assert.equal(exam.guideSection,'assessment');assert.match(exam.text,/Không có tỷ trọng điểm/);
});
test('bot retrieves relevant concepts and transparently refuses unknown material',()=>{
 for(const [question,id] of [['recv không đủ byte','net-tcp'],['fetch 404','web-async'],['data leakage chuẩn hóa','ml-data'],['broker mqtt retained','iot-mqtt']]){const a=answerQuestion(question);assert.equal(a.nodeIds[0],id,question);assert.ok(a.matched);}
 const unknown=answerQuestion('Thị trường phái sinh năng lượng 2040?');assert.equal(unknown.matched,false);assert.match(unknown.text,/chưa tìm/);
 const empty=answerQuestion('');assert.equal(empty.matched,false);
 assert.equal(suggestedPrompts('ml').length,3);
});


test('bot connects lecture and grading answers to attributed course sources',()=>{
 const lecture=answerQuestion('Bài giảng môn học máy ở đâu?',{courseId:'ml'});
 assert.equal(lecture.guideSection,'lecture');assert.match(lecture.text,/nguồn tham khảo/);
 const grade=answerQuestion('Cách chấm điểm IT4062 như thế nào?',{courseId:'network'});
 assert.equal(grade.guideSection,'grading');assert.match(grade.text,/50% bài tập/);assert.match(grade.text,/lớp hiện tại/);
 const webGrade=answerQuestion('Tỷ trọng chấm điểm môn công nghệ web?',{courseId:'web'});
 assert.equal(webGrade.guideSection,'grading');assert.match(webGrade.text,/Chưa có tỷ trọng chính thức/);
});
