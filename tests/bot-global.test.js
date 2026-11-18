import test from 'node:test';
import assert from 'node:assert/strict';

test('Hỏi Bot launcher is available on all tabs, opens without navigation, and keeps node context', async () => {
  const handlers = {};
  const store = new Map();
  const app = {innerHTML:''};
  globalThis.localStorage = {getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  globalThis.location = {hash:'#/home'};
  globalThis.window = {scrollY:0,scrollTo:()=>{},addEventListener:(n,fn)=>{handlers['window:'+n]=fn;}};
  globalThis.document = {body:{style:{}},getElementById:id=>id==='app'?app:null,querySelector:()=>null,addEventListener:(n,fn)=>{handlers[n]=fn;}};
  globalThis.requestAnimationFrame = ()=>{};
  globalThis.fetch = async()=>({ok:false});
  await import('../app.js');
  const click = (action,dataset={})=>handlers.click({target:{closest:()=>({dataset:{action,...dataset}})}});
  const routes=['home','courses','course/network','node/net-tcp','community','my','help'];
  for (const route of routes) {
    location.hash='#/'+route;
    handlers['window:hashchange']();
    assert.match(app.innerHTML,/class="bot-launch [^"]*" data-action="chat-toggle"/,`no launcher on ${route}`);
    assert.match(app.innerHTML,/>Hỏi Bot<\/span>/,`wrong launcher on ${route}`);
    const currentHash=location.hash;
    click('chat-toggle');
    assert.equal(location.hash,currentHash,`bot click navigated away from ${route}`);
    assert.match(app.innerHTML,/class="bot-drawer"/,`chat drawer did not open on ${route}`);
    assert.match(app.innerHTML,/aria-expanded="true"/,`chat accessibility state wrong on ${route}`);
    if (route==='node/net-tcp') assert.match(app.innerHTML,/Đang hỏi tại:.*TCP/);
    click('chat-toggle');
    assert.doesNotMatch(app.innerHTML,/class="bot-drawer"/,`chat drawer did not close on ${route}`);
    assert.match(app.innerHTML,/>Hỏi Bot<\/span>/,`launcher disappeared on ${route}`);
  }
});
