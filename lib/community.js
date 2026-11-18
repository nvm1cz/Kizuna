import { createHash, randomUUID } from 'node:crypto';
import { getNode, getCourse, sampleQuestions } from '../data.js';

export const hashActor = actorId => createHash('sha256').update(String(actorId||'')).digest('hex').slice(0,32);
const aliases=['Một chú Ong Bách Khoa','Mèo Tò Mò','Cáo Nhỏ Kiên Trì','Gấu Học Hỏi','Chim Sẻ Đi Học','Rái Cá Chăm Chỉ','Thỏ Hay Hỏi','Sóc Kiên Nhẫn','Cú Mèo Tri Thức','Hải Ly Tìm Hiểu'];
const clean = (v,limit) => String(v ?? '').trim().replace(/\r\n/g,'\n').slice(0, limit);
const wrong = (message,status=400)=>Object.assign(new Error(message),{status});
const requireActor = actorId => {if(typeof actorId!=='string'|| !/^[a-zA-Z0-9_-]{16,100}$/.test(actorId)) throw wrong('Phiên của bạn chưa hợp lệ. Vui lòng tải lại trang.');return hashActor(actorId);};
const requireNode = nodeId=>{if(!getNode(nodeId))throw wrong('Không tìm thấy điểm kiến thức.');return nodeId;};
const validTarget = (type,id)=>type==='node'?Boolean(getNode(id)):type==='question'?/^([a-f0-9-]{8,50}|demo-q-[1-9][0-9]*)$/.test(id):false;
const safePublic = ({actorHash,...rest}) => rest;

export function createCommunityService(store){
 async function snapshot(actorId){
  const [q,a,v] = await Promise.all([store.readItems('questions'),store.readItems('replies'),store.readItems('votes')]);
  const allQ=[...sampleQuestions,...q];
  const count={}; const nodeCount={}; const mine=new Set(); const actorHash=actorId&&/^[a-zA-Z0-9_-]{16,100}$/.test(actorId)?hashActor(actorId):null;
  for(const item of v){if(item.targetType==='node') nodeCount[item.targetId]=(nodeCount[item.targetId]||0)+1;else count[item.targetId]=(count[item.targetId]||0)+1; if(actorHash===item.actorHash)mine.add(item.targetType+':'+item.targetId);}
  return {
   questions:allQ.filter(item=>!item.nodeId||getNode(item.nodeId)).map(item=>({...safePublic(item),empathyCount:count[item.id]||0,mine:actorHash===item.actorHash})).sort((x,y)=>y.empathyCount-x.empathyCount||Date.parse(y.createdAt)-Date.parse(x.createdAt)),
   replies:a.filter(item=>allQ.some(q=>q.id===item.questionId)).map(safePublic).sort((x,y)=>Date.parse(x.createdAt)-Date.parse(y.createdAt)),
   nodeCounts:nodeCount,
   myEmpathy:[...mine],
  };
 }
 async function mutate(input){
  const action=clean(input.action,30); const actorHash=requireActor(input.actorId);
  if(action==='ask'){
   const nodeId=clean(input.nodeId,100), requestedCourseId=clean(input.courseId,50);
   if(nodeId&&!getNode(nodeId))throw wrong('Không tìm thấy điểm kiến thức.');
   if(requestedCourseId&&!getCourse(requestedCourseId))throw wrong('Không tìm thấy môn học.');
   const courseId=getNode(nodeId)?.courseId||requestedCourseId||'';
   const title=clean(input.title,120),body=clean(input.body,1500);
   const recent=await store.readItems('questions');
   if(recent.some(x=>x.actorHash===actorHash && Date.now()-Date.parse(x.createdAt)<20000))throw wrong('Bạn vừa gửi một câu hỏi. Hãy thử lại sau ít giây.',429);
   const id=randomUUID(), now=new Date().toISOString();
   const alias=aliases[Math.floor(Math.random()*aliases.length)];
   const item={id,nodeId,courseId,title,body,alias,createdAt:now,actorHash};
   await store.writeItem('questions',id,item);
   return {ok:true,id,alias};
  }
  if(action==='reply'){
   const nodeId=clean(input.nodeId,100), questionId=clean(input.questionId,60), body=clean(input.body,1600);
   if(body.length<8)throw wrong('Câu trả lời cần có ít nhất 8 ký tự.');
   const qs=[...sampleQuestions,...await store.readItems('questions')];
   if(!qs.some(q=>q.id===questionId&&(q.nodeId||'')===nodeId))throw wrong('Câu hỏi không còn tồn tại.',404);
   const id=randomUUID();
   await store.writeItem('replies',id,{id,questionId,nodeId,body,alias:aliases[Math.floor(Math.random()*aliases.length)],actorHash,createdAt:new Date().toISOString()});
   return {ok:true,id};
  }
  if(action==='empathize'){
   const targetType=clean(input.targetType,20),targetId=clean(input.targetId,60);
   if(!validTarget(targetType,targetId))throw wrong('Mục đồng cảm không hợp lệ.');
   const qs=targetType==='question'?[...sampleQuestions,...await store.readItems('questions')]:[];
   if(targetType==='question'&&!qs.some(x=>x.id===targetId))throw wrong('Câu hỏi không còn tồn tại.',404);
   const id=targetType+'--'+targetId+'--'+actorHash;
   const votes=await store.readItems('votes');
   if(votes.some(v=>v.id===id))return {ok:true,already:true};
   try {await store.writeItem('votes',id,{id,targetType,targetId,actorHash,createdAt:new Date().toISOString()});}
   catch(e){if(e.code==='DUPLICATE')return {ok:true,already:true};throw e;}
   return {ok:true,already:false};
  }
  if(action==='feedback'){
   const rating=clean(input.rating,30),text=clean(input.text,1200);
   if(!['dễ dùng','bình thường','khó dùng'].includes(rating)||text.length<8)throw wrong('Hãy chọn mức độ trải nghiệm và ghi góp ý từ 8 ký tự.');
   const id=randomUUID();await store.writeItem('feedback',id,{id,rating,text,actorHash,createdAt:new Date().toISOString()});return {ok:true};
  }
  if(action==='report'){
   const questionId=clean(input.questionId,60),reason=clean(input.reason,300);
   if(!questionId||reason.length<8)throw wrong('Vui lòng nhập lý do báo cáo từ 8 ký tự.');
   const qs=[...sampleQuestions,...await store.readItems('questions')];
   if(!qs.some(q=>q.id===questionId))throw wrong('Câu hỏi không tồn tại.',404);
   const id=randomUUID(); await store.writeItem('reports',id,{id,questionId,reason,actorHash,createdAt:new Date().toISOString()});return {ok:true};
  }
  throw wrong('Thao tác không được hỗ trợ.');
 }
 return {snapshot,mutate};
}
