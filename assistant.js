/**
 * Kizuna bot: local rule-based RETRIEVAL DEMO, NOT a language model.
 * No external model, remote API, account identity, or claim of verified facts.
 * Structured answer: {text, nodeIds, courseId, matched}.
 */
import {courses,nodes,getNode} from './data.js';
import {courseGuides} from './learning-guides.js';
import {courseEvidence} from './course-evidence.js';

const stopWords=new Set('la co cua voi cho khi trong tren mot nhung cac the nao tai sao gi nhu theo den tu duoc khong minh toi em anh ban o va he hoc moi tim giai thich giup dinh nghia khac biet vi du cau hoi'.split(' '));
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const tokens=s=>[...new Set(fold(s).split(/[^a-z0-9]+/g).filter(w=>w.length>=2&&!stopWords.has(w)))];
const synonyms={
 'net-tcp':['recv','send','socket','tcp','accept','connect','client','server','nhan thieu','du byte','ket noi'],
 'net-concurrency':['select','poll','epoll','thread','pthread','da luong','mutex','deadlock','race','nhieu client'],
 'net-udp':['udp','datagram','sendto','recvfrom','mat goi'],
 'net-framing':['giao thuc','dong khung','framing','length prefix','thong diep'],
 'web-async':['fetch','promise','async','await','404','http error'],
 'web-http':['rest','api','get','post','http','status code','json'],
 'web-backend':['database','csdl','sql','xss','bao mat'],
 'ml-data':['leakage','data leakage','chia tap','train test','chuan hoa','scaler','tien xu ly'],
 'ml-regression':['ridge','lasso','alpha','regularization','hoi quy'],
 'ml-trees':['cay quyet dinh','decision tree','overfitting'],
 'ml-svm':['svm','support vector','hinge loss'],
 'ml-evaluation':['metric','mae','mse','rmse','precision','recall','accuracy'],
 'iot-hardware':['cam bien','sensor','nhiet do','do am'],
 'iot-mqtt':['mqtt','broker','qos','retain','retained','publish','subscribe'],
 'iot-dashboard':['dashboard','bieu do','hien thi']
};
const extra={
 'net-tcp':'Ví dụ: server gọi accept() để có socket giao tiếp. recv() có thể chỉ trả một phần byte đã gửi, vì TCP là **luồng byte**, không phải luồng thông điệp. Hãy đọc lặp và tự xác định ranh giới bằng độ dài thông điệp hoặc ký tự phân cách.',
 'net-concurrency':'Ví dụ: select()/poll() chỉ **báo socket sẵn sàng**, không tự đọc dữ liệu. epoll là API dành cho Linux. Khi nhiều thread thay đổi danh sách client, dùng mutex để bảo vệ dữ liệu chung.',
 'web-async':'Ví dụ: fetch("/api/tasks") với HTTP 404 thường vẫn resolve Promise. Hãy kiểm tra response.ok và hiển thị lỗi rõ ràng cho người dùng.',
 'ml-data':'Ví dụ: nếu chuẩn hóa toàn bộ dữ liệu rồi mới chia train/test, bạn đã vô tình dùng thống kê của test để huấn luyện. Hãy chia tập trước, fit scaler trên train, rồi transform validation/test.',
 'iot-mqtt':'Ví dụ: retained message lưu bản tin cuối cùng cho một topic khi bật retained; nó KHÔNG đồng nghĩa broker lưu toàn bộ lịch sử. Persistent session là khái niệm khác.'
};
const genericGuidance={project:'Bài tập lớn',lecture:'Bài giảng',lecturer:'Yêu cầu giảng viên',grading:'Cách chấm điểm',assessment:'Cấu trúc kiểm tra/thi'};
export function suggestedPrompts(courseId='network',nodeId=null){
 const node=getNode(nodeId);
 if(node)return [`Giải thích ${node.title}`,`Ví dụ thực tế của ${node.title}`,`Bài tập lớn áp dụng ${node.title} thế nào?`];
 const course=courses.find(c=>c.id===courseId);
 return [`Cách làm bài tập lớn môn ${course?.name||'Lập trình mạng'}`, 'Giảng viên thường yêu cầu gì?', 'Cấu trúc thi và đánh giá ra sao?'];
}
export function answerQuestion(question,{courseId=null,nodeId=null}={}){
 const raw=String(question||'').trim().slice(0,1000),q=fold(raw);
 if(!raw)return {text:'Hãy nhập câu hỏi để mình tìm nội dung minh họa phù hợp nhé.',nodeIds:[],courseId:courseId||null,matched:false};
 const chosenCourse=(courses.find(c=>q.includes(fold(c.name))||q.includes(fold(c.code)))?.id)||courseId||getNode(nodeId)?.courseId||null;
 const guide=courseGuides[chosenCourse]||courseGuides.network;
 const evidence=courseEvidence[chosenCourse]||courseEvidence.network;
 const project=/(bai tap lon|btl|project|do an|mini project|lam du an|xay dung san pham)/.test(q);
 const lecture=/(bai giang|slide|giao trinh|tai lieu tham khao|hoc lieu)/.test(q);
 const grading=/(cham diem|ty trong|tinh diem|thang diem|co cau diem)/.test(q);
 const requirement=/(giang vien|yeu cau|deadline|nop bai|bao ve|rubric)/.test(q);
 const exam=/(cau truc|kiem tra|danh gia|cuoi ky|giua ky)/.test(q)||/(^|\s)thi(\s|$)/i.test(raw);
 if(project||lecture||grading||requirement||exam){
  const section=project?'project':lecture?'lecture':grading?'grading':requirement?'lecturer':'assessment';
  const title=genericGuidance[section];
  let text='';let ids=[];
  if(section==='project'){
   text=`**${title} — ví dụ minh họa**\n${guide.scenario}.\n${guide.project.slice(0,3).map((s,i)=>`${i+1}. ${s.title}: ${s.detail}`).join('\n')}\nCác bước còn lại và checklist nộp bài nằm trong **Cẩm nang học phần**. Đây KHÔNG phải đề bài do giảng viên giao.`;
   ids=guide.project.slice(0,3).map(x=>x.node);
  }else if(section==='lecture'){
   text=`**${title} — nguồn tham khảo**\n${evidence.lectures.slice(0,3).map((s,i)=>`${i+1}. ${s.title}: ${s.desc}`).join('\n')}\nMở mục **Bài giảng** trong Cẩm nang để xem liên kết nguồn. Chưa xác nhận đây là slide của lớp hiện tại.`;
  }else if(section==='grading'){
   text=`**${title} — thông tin công khai**\n${evidence.grading.slice(0,3).map(x=>`• ${x.title}: ${x.detail}`).join('\n')}\n**Lưu ý:** ${evidence.note} Xem nguồn và mốc thời gian tại mục **Chấm điểm**.`;
  }else if(section==='lecturer'){
   text=`**${title} — các ví dụ theo nguồn**\n${evidence.requirements.slice(0,3).map(x=>`• ${x.title}: ${x.detail}`).join('\n')}\nĐây không phải thông báo chính thức của lớp hiện tại. Xem link nguồn ở mục **Yêu cầu GV**.`;
  }else{
   text=`**${title} — ví dụ minh họa**\n${guide.assessment.map(x=>`• ${x.title}: ${x.detail}`).join('\n')}\nKhông có tỷ trọng điểm hay lịch thi chính thức; hãy đối chiếu đề cương và LMS của lớp.`;
  }
  return {text,nodeIds:ids,courseId:chosenCourse||'network',matched:true,guideSection:section};
 }
 const qTerms=tokens(raw);
 const ranked=nodes.map(n=>{
  const subject=[n.title,n.summary,...n.points,n.pitfall].join(' ');
  const subjectTerms=new Set(tokens(subject));
  let score=qTerms.reduce((sum,term)=>sum+(subjectTerms.has(term)?3:0),0);
  const code=fold(n.title);
  if(q.length>6&&(code.includes(q)||q.includes(code)))score+=15;
  for(const hint of synonyms[n.id]||[])if(q.includes(hint))score+=9;
  if(n.id===nodeId)score+=3;
  if(n.courseId===chosenCourse)score+=1;
  return {n,score};
 }).sort((a,b)=>b.score-a.score);
 const best=ranked[0];
 if(best?.score>=10){
  const n=best.n;
  const text=[`**${n.title}**`,n.summary,extra[n.id]||`Ý quan trọng: ${n.points.slice(0,2).join(' ')}`,`**Điểm dễ nhầm:** ${n.pitfall}`,`**Tự kiểm tra:** ${n.flash[0]?.q||'Bạn có giải thích lại bằng lời của mình không?'}`,`Đây là câu trả lời mô phỏng từ nội dung mẫu của Kizuna. Nếu cần giải thích sâu hoặc ví dụ khác, hãy hỏi cộng đồng tại Node.`].join('\n\n');
  return {text,nodeIds:[n.id],courseId:n.courseId,matched:true};
 }
 if(nodeId&&getNode(nodeId)){
  const n=getNode(nodeId);
  return {text:`Mình chưa có lời giải được chuẩn bị cho câu này. Với Node **${n.title}**, bạn có thể bắt đầu từ: ${n.points[0]}\n\nHãy hỏi cụ thể hơn (ví dụ nêu tên hàm/lỗi) hoặc chuyển sang **Hỏi ẩn danh** để cộng đồng cùng giải thích. Bot này hiện chỉ mô phỏng theo bộ tri thức mẫu, chưa được huấn luyện như AI.`,nodeIds:[n.id],courseId:n.courseId,matched:false};
 }
 return {text:'Mình chưa tìm được nội dung minh họa phù hợp với câu hỏi này. Hãy thêm tên môn, chủ đề hoặc lỗi cụ thể (ví dụ: “TCP recv thiếu byte”). Bạn cũng có thể mở Node tương ứng và hỏi cộng đồng ẩn danh.\n\n*Lưu ý:* Bot hiện là bộ trả lời mô phỏng theo dữ liệu mẫu, không phải AI đã được huấn luyện.',nodeIds:[],courseId:chosenCourse,matched:false};
}
