import test from 'node:test';
import assert from 'node:assert/strict';
import {nodes,courses} from '../data.js';

// The learning map must preserve prerequisite relations, rather than inventing a fixed path.
test('the new roadmap keeps all course nodes in four stages, with working direct links', async()=>{
 const handlers={},store=new Map();
 const app={innerHTML:''};
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 globalThis.location={hash:'#/course/network'};
 globalThis.window={scrollY:0,scrollTo:()=>{},addEventListener:(k,v)=>handlers['window:'+k]=v};
 globalThis.document={body:{style:{}},getElementById:id=>id==='app'?app:null,querySelector:()=>null,addEventListener:(k,v)=>handlers[k]=v};
 globalThis.requestAnimationFrame=()=>{};
 globalThis.fetch=async()=>({ok:false});
 await import('../app.js');
 for(const c of courses){
   location.hash='#/course/'+c.id;
   handlers['window:hashchange']();
   const sub=nodes.filter(n=>n.courseId===c.id);
   assert.equal((app.innerHTML.match(/class="roadmap-stage"/g)||[]).length,4,`roadmap stages for ${c.id}`);
   assert.equal((app.innerHTML.match(/data-map-node="/g)||[]).length,sub.length,`roadmap node count ${c.id}`);
   for(const n of sub){
     assert.ok(app.innerHTML.includes(`data-path="node/${n.id}"`));
     if(n.deps.length)assert.match(app.innerHTML,new RegExp(`Học sau: `));
   }
   const root=sub.find(n=>n.deps.length===0);
   assert.ok(app.innerHTML.includes(`data-path="node/${root.id}"`),`root recommended for ${c.id}`);
 }
 // Mark a Node as understood; the map should highlight it in green without a next-step banner.
 location.hash='#/course/network';handlers['window:hashchange']();
 const click=(dataset)=>handlers.click({target:{closest:()=>({dataset})}});
 click({action:'set-status',id:'net-foundation',status:'clear'});
 assert.doesNotMatch(app.innerHTML,/GỢI Ý HỌC TIẾP|roadmap-next-action/);
 assert.match(app.innerHTML,/class="roadmap-card status-clear"[^>]+data-map-node="net-foundation"/);
 assert.match(app.innerHTML,/Luồng TCP &amp; vòng đời socket/);
 assert.ok(app.innerHTML.includes('data-map-node="net-practice"'));
 // No extra UI clutter injected into other screens.
 location.hash='#/community';handlers['window:hashchange']();
 assert.doesNotMatch(app.innerHTML,/roadmap-track/);
});
