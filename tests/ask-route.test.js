import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleQuestions} from '../data.js';

test('Community question action opens composer in place; optional course/topic selection; Node composer still works',async()=>{
  const handlers={}, store=new Map(), app={innerHTML:''};
  const topic={innerHTML:'',disabled:true};
  const submitted=[];
  globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  globalThis.location={hash:'#/community'};
  globalThis.window={scrollY:0,scrollTo:()=>{},addEventListener:(name,cb)=>handlers['window:'+name]=cb};
  globalThis.document={body:{style:{}},getElementById:id=>id==='app'?app:id==='ask-node'?topic:id==='main-content'?{scrollIntoView(){}}:null,querySelector:()=>null,addEventListener:(name,cb)=>handlers[name]=cb};
  globalThis.requestAnimationFrame=()=>{};
  globalThis.fetch=async(url,opts={})=>{
    if(opts.method==='POST'){
      submitted.push(JSON.parse(opts.body));
      return {ok:true,json:async()=>({ok:true,id:'test-ask-1',alias:'Bạn ẩn danh'})};
    }
    return {ok:true,json:async()=>({questions:[...sampleQuestions,...submitted.filter(x=>x.action==='ask').map((x,i)=>({id:'test'+i,nodeId:x.nodeId,title:x.title,body:x.body,alias:'Bạn ẩn danh',createdAt:new Date().toISOString()}))],replies:[],nodeCounts:{},myEmpathy:[]})};
  };
  await import('../app.js');
  assert.match(app.innerHTML,/data-action="ask">.*?Đặt câu hỏi mới/);
  const click=dataset=>handlers.click({target:{closest:()=>({dataset})}});
  click({action:'ask'});
  assert.equal(globalThis.location.hash,'#/community','ask should not navigate to courses');
  assert.match(app.innerHTML,/Đặt câu hỏi ẩn danh/);
  assert.match(app.innerHTML,/id="ask-course"/);
  assert.match(app.innerHTML,/id="ask-node"/);
  assert.doesNotMatch(app.innerHTML,/id="ask-body"[^>]*minlength=/);
  assert.doesNotMatch(app.innerHTML,/id="ask-title"[^>]*minlength=/);
  assert.doesNotMatch(app.innerHTML,/id="ask-body"[^>]*required/);
  assert.doesNotMatch(app.innerHTML,/id="ask-course"[^>]*required/);
  handlers.change({target:{id:'ask-course',value:'network',matches:()=>false}});
  assert.equal(topic.disabled,false);
  assert.match(topic.innerHTML,/net-tcp/);
  globalThis.FormData=class{get(key){return {nodeId:'net-tcp',title:'Vì sao recv không nhận đủ dữ liệu?',body:'Mình gửi TCP 2048 byte nhưng chỉ nhận được 1024 byte.'}[key]}};
  await handlers.submit({target:{id:'ask-form',querySelector:()=>({disabled:false})},preventDefault(){}});
  assert.equal(submitted.length,1);
  assert.equal(submitted[0].nodeId,'net-tcp');
  assert.equal(globalThis.location.hash,'#/community','submission should stay in community');
  assert.match(app.innerHTML,/Vì sao recv không nhận đủ dữ liệu\?/);
  click({action:'ask'});
  globalThis.FormData=class{get(){return ''}};
  await handlers.submit({target:{id:'ask-form',querySelector:()=>({disabled:false})},preventDefault(){}});
  assert.equal(submitted.length,2,'blank question should submit');
  assert.equal(submitted[1].title,'');
  assert.equal(submitted[1].body,'');
  assert.equal(submitted[1].nodeId,'');
  assert.equal(globalThis.location.hash,'#/community');
  assert.match(app.innerHTML,/Câu hỏi chưa có tiêu đề/);
  globalThis.location.hash='#/node/net-tcp';
  handlers['window:hashchange']();
  click({action:'ask',node:'net-tcp'});
  assert.match(app.innerHTML,/name="nodeId" value="net-tcp"/);
  assert.doesNotMatch(app.innerHTML,/id="ask-course"/);
});
