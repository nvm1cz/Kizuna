import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createCommunityService} from '../lib/community.js';
import {localStore} from '../lib/local-store.js';
import {courses,nodes,sampleQuestions} from '../data.js';
const device='test_device_abcdefghijklmnop1234';
const demo=async run=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'kizuna-test-'));try{return await run(createCommunityService(localStore(dir)));}finally{await fs.rm(dir,{recursive:true,force:true});}};
test('all 4 courses have complete, acyclic knowledge maps',()=>{
 assert.equal(courses.length,4);assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
 for(const course of courses){assert.ok(nodes.filter(n=>n.courseId===course.id).length>=5);}
 for(const n of nodes){assert.ok(courses.some(c=>c.id===n.courseId));assert.ok(n.summary.length>25);assert.ok(n.points.length>=2);assert.ok(n.pitfall.length>15);assert.ok(n.flash.length>=1&&n.flash.length<=2);assert.ok(n.resources.length>=1);for(const dep of n.deps){const d=nodes.find(x=>x.id===dep);assert.ok(d);assert.equal(d.courseId,n.courseId);assert.ok(d.stage<=n.stage);}}
 const path=[];function visit(id){assert.ok(!path.includes(id),'cyclic graph: '+path.join('>'));path.push(id);nodes.find(n=>n.id===id).deps.forEach(visit);path.pop();}nodes.forEach(n=>visit(n.id));
});
test('seed questions are clearly labeled demo',async()=>demo(async service=>{
 const s=await service.snapshot(device);assert.equal(s.questions.length,sampleQuestions.length);assert.ok(s.questions.every(x=>x.demo));assert.equal(s.myEmpathy.length,0);
}));
test('ask, anonymous alias, reply, and empathy are persisted across snapshots',async()=>demo(async service=>{
 const result=await service.mutate({action:'ask',actorId:device,nodeId:'net-tcp',title:'Tại sao socket bị đóng?',body:'Mình đã thử recv() nhiều lần nhưng vẫn nhận dữ liệu rỗng.'});assert.ok(result.id);assert.ok(result.alias);
 let s=await service.snapshot(device);const q=s.questions.find(q=>q.id===result.id);assert.ok(q);assert.ok(!('actorHash' in q));assert.equal(q.mine,true);
 await service.mutate({action:'reply',actorId:device,nodeId:'net-tcp',questionId:result.id,body:'Khi recv trả 0 byte nghĩa là bên kia đã đóng nửa gửi của kết nối.'});
 assert.equal((await service.snapshot(device)).replies.filter(x=>x.questionId===q.id).length,1);
 const added=await service.mutate({action:'empathize',actorId:device,targetType:'question',targetId:q.id});assert.equal(added.already,false);
 const repeat=await service.mutate({action:'empathize',actorId:device,targetType:'question',targetId:q.id});assert.equal(repeat.already,true);
 s=await service.snapshot(device);assert.equal(s.questions.find(x=>x.id===q.id).empathyCount,1);assert.ok(s.myEmpathy.includes('question:'+q.id));
 await service.mutate({action:'empathize',actorId:device,targetType:'node',targetId:'net-tcp'});
 assert.equal((await service.snapshot(device)).nodeCounts['net-tcp'],1);
}));
test('input validation, feedback, report and posting rate limits',async()=>demo(async service=>{
 await assert.rejects(service.mutate({action:'ask',actorId:device,nodeId:'not-a-node',title:'A very good question',body:'a sufficiently detailed question'}),/điểm kiến thức/);
 const first=await service.mutate({action:'ask',actorId:device,nodeId:'net-tcp',title:'Câu hỏi về TCP socket',body:'Mình vẫn chưa hiểu tại sao một socket đóng khi nhận 0 byte.'});
 await assert.rejects(service.mutate({action:'ask',actorId:device,nodeId:'net-tcp',title:'Câu hỏi tiếp theo',body:'Mình vẫn chưa hiểu liệu có thể giữ socket đang nghe hay không.'}),/vừa gửi/);
 await service.mutate({action:'report',actorId:device,questionId:first.id,reason:'Nội dung này có vấn đề cần xem lại.'});
 await service.mutate({action:'feedback',actorId:device,rating:'dễ dùng',text:'Mình muốn thêm tài liệu học chính thức để tra cứu.'});
}));

test('blank and very short questions can be posted, read and replied to without a topic',async()=>demo(async service=>{
 const blankDevice='test_blank_device_abcdefg123456';
 const result=await service.mutate({action:'ask',actorId:blankDevice,nodeId:'',courseId:'',title:'',body:''});
 const snapshot=await service.snapshot(blankDevice);
 const item=snapshot.questions.find(q=>q.id===result.id);
 assert.ok(item,'blank question should be visible to everyone');
 assert.equal(item.nodeId,'');
 assert.equal(item.courseId,'');
 assert.equal(item.title,'');
 assert.equal(item.body,'');
 await service.mutate({action:'reply',actorId:blankDevice,nodeId:'',questionId:result.id,body:'Bạn có thể mô tả rõ tình huống đang gặp không?'});
 assert.equal((await service.snapshot(blankDevice)).replies.some(r=>r.questionId===result.id),true);
 const short=await service.mutate({action:'ask',actorId:'test_short_device_abcdefg12345',nodeId:'net-tcp',title:'ok',body:'hi'});
 assert.equal((await service.snapshot('test_short_device_abcdefg12345')).questions.find(q=>q.id===short.id)?.body,'hi');
 const courseOnly=await service.mutate({action:'ask',actorId:'test_course_device_abcdefg12345',courseId:'network',title:'',body:''});
 assert.equal((await service.snapshot('test_course_device_abcdefg12345')).questions.find(q=>q.id===courseOnly.id)?.courseId,'network');
}));

test('lecturer reviews are validated and held for moderation, not published to community',async()=>{
 const items={questions:[],replies:[],votes:[],feedback:[],reports:[],lecturerReviews:[]};
 const store={readItems:async kind=>items[kind]||[],writeItem:async(kind,id,item)=>{(items[kind]||=[]).push(item)}};
 const svc=createCommunityService(store);
 const actorId='private-review-user-123456789';
 await assert.rejects(svc.mutate({action:'lecturerReview',actorId,courseId:'network',lecturer:'A',rating:4,text:'Đánh giá quá ngắn'}),/Tên giảng viên|Nhập tên giảng viên/);
 const result=await svc.mutate({action:'lecturerReview',actorId,courseId:'network',lecturer:'Giảng viên minh họa',term:'2026.1',rating:4,text:'Cách giảng có các ví dụ socket rõ ràng, phần lab cần dành thêm thời gian.'});
 assert.equal(result.reviewStatus,'pending');
 assert.equal(items.lecturerReviews.length,1);
 assert.equal(items.lecturerReviews[0].published,false);
 const snapshot=await svc.snapshot(actorId);
 assert.equal('lecturerReviews' in snapshot,false);
 await assert.rejects(svc.mutate({action:'lecturerReview',actorId,courseId:'network',lecturer:'Giảng viên minh họa',rating:3,text:'Góp ý lần thứ hai trong thời gian quá gần để kiểm tra rate limiting.'}),/vừa gửi review/);
});
