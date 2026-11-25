-- Kizuna — cấu trúc database Supabase.
-- Cách dùng: Supabase Dashboard → SQL Editor → dán toàn bộ file → Run. Chạy lại nhiều lần vẫn an toàn.
--
-- Nguyên tắc bảo mật:
--   * Mọi bảng đều bật Row Level Security (RLS). Khách chưa đăng nhập (anon) không có quyền gì.
--   * Tiến độ học: mỗi người chỉ đọc/ghi dòng của chính mình.
--   * Hỏi đáp: trình duyệt KHÔNG đọc thẳng bảng, chỉ gọi các hàm ở phần 3,
--     nhờ vậy user_id của người hỏi không bao giờ lộ ra cho người khác.

-- ---------------------------------------------------------------------------
-- 1. Tiến độ học
-- ---------------------------------------------------------------------------

create table if not exists public.node_progress (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  node_id    text not null check (node_id ~ '^[a-z0-9-]{1,60}$'),
  status     text not null check (status in ('explore', 'stuck', 'clear')),
  updated_at timestamptz not null default now(),
  primary key (user_id, node_id)
);

-- Flash-check đã mở và checklist bài tập lớn.
create table if not exists public.study_state (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  answers      jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object' and length(answers::text) < 20000),
  guide_checks jsonb not null default '{}'::jsonb check (jsonb_typeof(guide_checks) = 'object' and length(guide_checks::text) < 20000),
  updated_at   timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists touch on public.node_progress;
create trigger touch before update on public.node_progress for each row execute function public.touch_updated_at();
drop trigger if exists touch on public.study_state;
create trigger touch before update on public.study_state for each row execute function public.touch_updated_at();

alter table public.node_progress enable row level security;
alter table public.study_state enable row level security;

drop policy if exists "own progress" on public.node_progress;
create policy "own progress" on public.node_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own state" on public.study_state;
create policy "own state" on public.study_state for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.node_progress, public.study_state from anon, authenticated;
grant select, insert, update, delete on public.node_progress, public.study_state to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Hỏi đáp, báo cáo, góp ý
--    Muốn ẩn nội dung vi phạm: Table Editor → đặt hidden = true.
-- ---------------------------------------------------------------------------

create table if not exists public.questions (
  id         text primary key default gen_random_uuid()::text,
  user_id    uuid references auth.users (id) on delete set null,
  node_id    text not null default '' check (node_id ~ '^[a-z0-9-]{0,60}$'),
  course_id  text not null default '' check (course_id ~ '^[a-z0-9-]{0,40}$'),
  title      text not null default '' check (length(title) <= 120),
  body       text not null default '' check (length(body) <= 1500),
  alias      text not null,
  demo       boolean not null default false,
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id          text primary key default gen_random_uuid()::text,
  question_id text not null references public.questions (id) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,
  body        text not null check (length(body) between 8 and 1600),
  alias       text not null,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.empathy (
  user_id     uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('node', 'question')),
  target_id   text not null check (length(target_id) between 1 and 60),
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  question_id text not null references public.questions (id) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,
  reason      text not null check (length(reason) between 8 and 300),
  created_at  timestamptz not null default now()
);

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  rating     text not null check (rating in ('dễ dùng', 'bình thường', 'khó dùng')),
  body       text not null check (length(body) between 8 and 1200),
  created_at timestamptz not null default now()
);

create index if not exists questions_created on public.questions (created_at desc);
create index if not exists questions_user on public.questions (user_id, created_at desc);
create index if not exists replies_question on public.replies (question_id, created_at);
create index if not exists replies_user on public.replies (user_id, created_at desc);
create index if not exists empathy_target on public.empathy (target_type, target_id);

alter table public.questions enable row level security;
alter table public.replies enable row level security;
alter table public.empathy enable row level security;
alter table public.reports enable row level security;
alter table public.feedback enable row level security;

-- Cố ý không tạo policy: chỉ các hàm bên dưới và quản trị viên đọc/ghi được.
revoke all on public.questions, public.replies, public.empathy, public.reports, public.feedback from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Các hàm trình duyệt được gọi
-- ---------------------------------------------------------------------------

-- Hàm nội bộ đặt ở schema riêng để API không gọi tới được.
create schema if not exists kizuna;
revoke all on schema kizuna from public, anon, authenticated;

create or replace function kizuna.require_user() returns uuid
language plpgsql stable set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Bạn cần đăng nhập để thực hiện.'; end if;
  return uid;
end $$;

create or replace function kizuna.random_alias() returns text
language sql volatile set search_path = '' as $$
  select (array['Một chú Ong Bách Khoa', 'Mèo Tò Mò', 'Cáo Nhỏ Kiên Trì', 'Gấu Học Hỏi', 'Chim Sẻ Đi Học',
    'Rái Cá Chăm Chỉ', 'Thỏ Hay Hỏi', 'Sóc Kiên Nhẫn', 'Cú Mèo Tri Thức', 'Hải Ly Tìm Hiểu'])[1 + floor(random() * 10)::int]
$$;

create or replace function public.community_snapshot() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  return (
    with visible as (
      select q.* from public.questions q where not q.hidden order by q.created_at desc limit 500
    ), counted as (
      select v.*, (select count(*) from public.empathy e where e.target_type = 'question' and e.target_id = v.id) as votes
      from visible v
    )
    select jsonb_build_object(
      'questions', coalesce((select jsonb_agg(jsonb_build_object(
          'id', c.id, 'nodeId', c.node_id, 'courseId', c.course_id, 'title', c.title, 'body', c.body,
          'alias', c.alias, 'demo', c.demo, 'createdAt', c.created_at,
          'mine', c.user_id is not distinct from uid, 'empathyCount', c.votes
        ) order by c.votes desc, c.created_at desc) from counted c), '[]'::jsonb),
      'replies', coalesce((select jsonb_agg(jsonb_build_object(
          'id', r.id, 'questionId', r.question_id, 'body', r.body, 'alias', r.alias, 'createdAt', r.created_at
        ) order by r.created_at) from public.replies r join visible v on v.id = r.question_id where not r.hidden), '[]'::jsonb),
      'nodeCounts', coalesce((select jsonb_object_agg(n.target_id, n.total) from (
          select e.target_id, count(*) as total from public.empathy e where e.target_type = 'node' group by e.target_id
        ) n), '{}'::jsonb),
      'myEmpathy', coalesce((select jsonb_agg(e.target_type || ':' || e.target_id)
          from public.empathy e where e.user_id = uid), '[]'::jsonb)
    )
  );
end $$;

create or replace function public.ask_question(p_node_id text, p_course_id text, p_title text, p_body text) returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); new_id text;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text, 1));
  if exists (select 1 from public.questions q where q.user_id = uid and q.created_at > now() - interval '20 seconds') then
    raise exception 'Bạn vừa gửi một câu hỏi. Hãy thử lại sau ít giây.';
  end if;
  insert into public.questions (user_id, node_id, course_id, title, body, alias)
  values (uid, coalesce(btrim(p_node_id), ''), coalesce(btrim(p_course_id), ''),
    left(coalesce(btrim(p_title), ''), 120), left(coalesce(btrim(p_body), ''), 1500), kizuna.random_alias())
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.reply_question(p_question_id text, p_body text) returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); content text := left(coalesce(btrim(p_body), ''), 1600); new_id text;
begin
  if length(content) < 8 then raise exception 'Câu trả lời cần có ít nhất 8 ký tự.'; end if;
  if not exists (select 1 from public.questions q where q.id = p_question_id and not q.hidden) then
    raise exception 'Câu hỏi không còn tồn tại.';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text, 2));
  if exists (select 1 from public.replies r where r.user_id = uid and r.created_at > now() - interval '5 seconds') then
    raise exception 'Bạn vừa gửi một phản hồi. Hãy thử lại sau ít giây.';
  end if;
  insert into public.replies (question_id, user_id, body, alias)
  values (p_question_id, uid, content, kizuna.random_alias()) returning id into new_id;
  return new_id;
end $$;

create or replace function public.add_empathy(p_target_type text, p_target_id text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  if p_target_type = 'question' then
    if not exists (select 1 from public.questions q where q.id = p_target_id and not q.hidden) then
      raise exception 'Câu hỏi không còn tồn tại.';
    end if;
  elsif p_target_type is distinct from 'node' or p_target_id is null or p_target_id !~ '^[a-z0-9-]{1,60}$' then
    raise exception 'Mục đồng cảm không hợp lệ.';
  end if;
  insert into public.empathy (user_id, target_type, target_id) values (uid, p_target_type, p_target_id)
  on conflict do nothing;
end $$;

create or replace function public.report_question(p_question_id text, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); content text := left(coalesce(btrim(p_reason), ''), 300);
begin
  if length(content) < 8 then raise exception 'Vui lòng nhập lý do từ 8 ký tự.'; end if;
  if not exists (select 1 from public.questions q where q.id = p_question_id) then
    raise exception 'Câu hỏi không còn tồn tại.';
  end if;
  if (select count(*) from public.reports r where r.user_id = uid and r.created_at > now() - interval '1 day') >= 20 then
    raise exception 'Bạn đã gửi nhiều báo cáo hôm nay. Hãy thử lại vào ngày mai.';
  end if;
  insert into public.reports (question_id, user_id, reason) values (p_question_id, uid, content);
end $$;

create or replace function public.send_feedback(p_rating text, p_body text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); content text := left(coalesce(btrim(p_body), ''), 1200);
begin
  if p_rating is null or p_rating not in ('dễ dùng', 'bình thường', 'khó dùng') or length(content) < 8 then
    raise exception 'Hãy chọn mức độ trải nghiệm và ghi góp ý từ 8 ký tự.';
  end if;
  if (select count(*) from public.feedback f where f.user_id = uid and f.created_at > now() - interval '1 day') >= 10 then
    raise exception 'Bạn đã gửi nhiều góp ý hôm nay. Cảm ơn bạn!';
  end if;
  insert into public.feedback (user_id, rating, body) values (uid, p_rating, content);
end $$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function kizuna.require_user(), kizuna.random_alias() from public, anon, authenticated;
revoke all on function public.community_snapshot(), public.ask_question(text, text, text, text), public.reply_question(text, text),
  public.add_empathy(text, text), public.report_question(text, text), public.send_feedback(text, text) from public, anon, authenticated;
grant execute on function public.community_snapshot(), public.ask_question(text, text, text, text), public.reply_question(text, text),
  public.add_empathy(text, text), public.report_question(text, text), public.send_feedback(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Câu hỏi minh họa
-- ---------------------------------------------------------------------------

insert into public.questions (id, node_id, course_id, alias, title, body, demo, created_at) values
  ('demo-q-1', 'net-tcp', 'network', 'Một chú Ong Bách Khoa', 'Vì sao recv() không nhận đủ số byte đã gửi?', 'Mình gửi một thông điệp 2 KB nhưng recv() chỉ nhận khoảng 1 KB. Có phải server bị lỗi không?', true, '2026-11-01T09:00:00Z'),
  ('demo-q-2', 'net-concurrency', 'network', 'Mèo Tò Mò', 'select() khác poll() chủ yếu ở điểm nào?', 'Mình hiểu cả hai đều chờ socket sẵn sàng, nhưng chưa rõ vì sao phải dùng poll/epoll.', true, '2026-11-02T08:30:00Z'),
  ('demo-q-3', 'web-async', 'web', 'Chim Sẻ Đi Học', 'fetch trả 404 mà catch() không chạy?', 'Mình đã bọc await fetch trong try/catch nhưng API trả 404 thì nhánh catch không được chạy.', true, '2026-11-04T10:10:00Z'),
  ('demo-q-4', 'ml-data', 'ml', 'Gấu Học Hỏi', 'Vì sao phải chia tập trước khi chuẩn hóa?', 'Nếu dùng mean và std của cả dữ liệu thì kết quả chỉ tốt hơn thôi mà?', true, '2026-11-05T12:00:00Z'),
  ('demo-q-5', 'iot-mqtt', 'iot', 'Cáo Nhỏ Kiên Trì', 'Broker MQTT có lưu mọi tin nhắn không?', 'Mình đang nhầm giữa retained message và persistent session. Có tài liệu dễ hiểu không?', true, '2026-11-07T07:50:00Z')
on conflict (id) do nothing;
