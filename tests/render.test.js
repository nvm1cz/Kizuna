import test from 'node:test';
import assert from 'node:assert/strict';

test('course guide tabs and bot interactions render across pages',async()=>{
 const handlers={};const store=new Map();const app={innerHTML:''};
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 globalThis.location={hash:'#/course/network'};
 globalThis.window={scrollY:0,scrollTo:()=>{},addEventListener:(n,fn)=>{handlers['window:'+n]=fn;}};
 globalThis.document={body:{style:{}},getElementById:id=>id==='app'?app:null,querySelector:()=>null,addEventListener:(n,fn)=>{handlers[n]=fn;}};
 globalThis.requestAnimationFrame=()=>{};
 globalThis.fetch=async()=>({ok:false});
 await import('../app.js');
 assert.match(app.innerHTML,/Bài giảng, bài tập lớn & cách chấm thi/);
 assert.doesNotMatch(app.innerHTML,/Xây dựng một chatroom TCP/);
 function click(dataset){handlers.click({target:{closest:()=>({dataset})}});}
 click({action:'guide-toggle'});
 assert.match(app.innerHTML,/Cẩm nang học phần/);
 assert.match(app.innerHTML,/Bài giảng & tài liệu/);
 click({action:'guide-tab',tab:'project'});assert.match(app.innerHTML,/Xây dựng một chatroom TCP/);
 click({action:'guide-tab',tab:'grading'});assert.match(app.innerHTML,/50% bài tập/);
 click({action:'guide-tab',tab:'lecturer'});assert.match(app.innerHTML,/Hiểu rõ yêu cầu trước khi bắt đầu/);
 click({action:'guide-tab',tab:'assessment'});assert.match(app.innerHTML,/Chuẩn bị kiểm tra và bảo vệ/);
 click({action:'chat-open'});assert.match(app.innerHTML,/Kizuna Bot/);assert.match(app.innerHTML,/MÔ PHỎNG/);
 click({action:'chat-prompt',query:'Vì sao recv không nhận đủ byte?'});
 assert.match(app.innerHTML,/TCP là/);assert.match(app.innerHTML,/luồng byte/);
 assert.ok(JSON.parse(store.get('kizuna-mvp-state-v1')).chat.length>=2);
});
