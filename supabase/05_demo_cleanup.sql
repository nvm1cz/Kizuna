-- XÓA DỮ LIỆU MẪU của 04_demo.sql. TỰ SINH bằng "npm run seed".

-- 1. Người đóng góp mẫu, bài đã gửi, câu hỏi mẫu. Không đụng tới người dùng thật.
delete from auth.users where email like '%@demo.hustree.invalid';
delete from public.questions where id like 'mau-%' and demo;

-- 2. Bảy môn mẫu cùng Node, tài liệu, đề thi, kể cả phần admin đã sửa hoặc người dùng đã đóng góp vào đó.
--    Chỉ bỏ dấu -- ở dòng dưới khi chắc chắn muốn xóa.
-- delete from public.courses where id in ('mi1111', 'mi1141', 'it1110', 'it3011', 'it3070', 'it3080', 'it3090');
