/** Danh sách môn học và hàm tra cứu. Nội dung minh họa, không phải đề cương được HUST xác nhận. */
import {networkNodes} from './nodes/network.js';
import {webNodes} from './nodes/web.js';
import {mlNodes} from './nodes/ml.js';
import {iotNodes} from './nodes/iot.js';

export const courses = [
  {id:'network', code:'IT4062', name:'Lập trình mạng', short:'Hiểu socket, giao thức và cách server xử lý nhiều kết nối.', icon:'network', color:'#5978d8', soft:'#eaf0ff', tags:['Socket','TCP/UDP','Concurrency']},
  {id:'web', code:'IT4409', name:'Công nghệ web', short:'Đi từ nền tảng trình duyệt đến API và bảo mật ứng dụng.', icon:'globe', color:'#de9774', soft:'#fff0e6', tags:['JavaScript','HTTP','API']},
  {id:'ml', code:'IT3190', name:'Học máy', short:'Nối các thuật toán với dữ liệu, đánh giá và bài toán thực tế.', icon:'brain', color:'#8a77be', soft:'#f0ebff', tags:['Dữ liệu','Mô hình','Đánh giá']},
  {id:'iot', code:'IT4735', name:'Internet of Things', short:'Hiểu cách cảm biến, thiết bị và hệ thống trao đổi dữ liệu.', icon:'cpu', color:'#4c9a8c', soft:'#e6f5ef', tags:['Cảm biến','MQTT','Thiết bị']}
];

export const nodes = [...networkNodes, ...webNodes, ...mlNodes, ...iotNodes];
export const stages=['Nền tảng','Khái niệm cốt lõi','Kết nối kiến thức','Thực hành'];
export const getCourse=id=>courses.find(x=>x.id===id);
export const getNode=id=>nodes.find(x=>x.id===id);
export const nodesOf=id=>nodes.filter(x=>x.courseId===id);
