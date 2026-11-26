-- Hustree v2 — vai trò, hồ sơ, nội dung, đóng góp, thông báo.
-- Chạy SAU 01_schema.sql. Chạy lại nhiều lần vẫn an toàn.
--
-- Nguyên tắc: mọi bảng bật RLS và KHÔNG có policy, trình duyệt chỉ gọi các hàm ở dưới.
-- Hàm nào chỉ dành cho admin đều gọi kizuna.require_admin() ở dòng đầu.

-- ---------------------------------------------------------------------------
-- 1. Trường, ngành, hồ sơ
-- ---------------------------------------------------------------------------

create table if not exists public.schools (
  id   text primary key check (id ~ '^[a-z0-9-]{2,30}$'),
  name text not null check (length(name) between 2 and 120),
  sort int not null default 0
);

create table if not exists public.majors (
  id        text primary key check (id ~ '^[A-Z0-9-]{2,12}$'),
  school_id text not null references public.schools (id) on delete cascade,
  name      text not null check (length(name) between 2 and 200),
  sort      int not null default 0
);

create table if not exists public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'user' check (role in ('user', 'admin')),
  display_name text check (length(display_name) between 2 and 40),
  major_id     text references public.majors (id) on delete set null,
  study_year   smallint check (study_year between 1 and 6),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Nội dung học
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id        text primary key check (id ~ '^[a-z0-9-]{2,30}$'),
  code      text not null check (length(code) between 2 and 20),
  name      text not null check (length(name) between 2 and 120),
  short     text not null default '' check (length(short) <= 200),
  icon      text not null default 'book' check (icon ~ '^[a-z]{2,20}$'),
  color     text not null default '#5978d8' check (color ~ '^#[0-9a-f]{6}$'),
  soft      text not null default '#eaf0ff' check (soft ~ '^#[0-9a-f]{6}$'),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Môn này nằm ở năm mấy của ngành nào.
create table if not exists public.course_majors (
  course_id  text not null references public.courses (id) on delete cascade,
  major_id   text not null references public.majors (id) on delete cascade,
  study_year smallint not null check (study_year between 1 and 6),
  primary key (course_id, major_id)
);

create table if not exists public.nodes (
  id         text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  course_id  text not null references public.courses (id) on delete cascade,
  stage      smallint not null check (stage between 0 and 3),
  title      text not null check (length(title) between 2 and 120),
  deps       text[] not null default '{}',
  summary    text not null default '' check (length(summary) <= 4000),
  pitfall    text not null default '' check (length(pitfall) <= 2000),
  flash      jsonb not null default '[]'::jsonb check (jsonb_typeof(flash) = 'array' and length(flash::text) < 20000),
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  node_id        text not null references public.nodes (id) on delete cascade,
  title          text not null check (length(title) between 2 and 160),
  url            text check (url ~* '^https?://' and length(url) <= 1000),
  file_path      text check (length(file_path) <= 300),
  contributor_id uuid references auth.users (id) on delete set null,
  sort           int not null default 0,
  created_at     timestamptz not null default now(),
  check ((url is null) <> (file_path is null))
);

create table if not exists public.course_guides (
  course_id text primary key references public.courses (id) on delete cascade,
  data      jsonb not null check (jsonb_typeof(data) = 'object' and length(data::text) < 60000)
);

create table if not exists public.lecturers (
  id        uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id) on delete cascade,
  data      jsonb not null check (jsonb_typeof(data) = 'object' and length(data::text) < 20000),
  sort      int not null default 0
);

create table if not exists public.exams (
  course_id text not null references public.courses (id) on delete cascade,
  term      text not null check (term in ('mid', 'final')),
  data      jsonb not null check (jsonb_typeof(data) = 'object' and length(data::text) < 60000),
  primary key (course_id, term)
);

create index if not exists nodes_course on public.nodes (course_id);
create index if not exists resources_node on public.resources (node_id);
create index if not exists resources_file on public.resources (file_path);
create index if not exists lecturers_course on public.lecturers (course_id);

-- Node tiên quyết phải cùng môn, không ở chặng sau và không tạo vòng lặp.
create or replace function public.check_node() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from unnest(new.deps) d where not exists (
      select 1 from public.nodes n where n.id = d and n.course_id = new.course_id and n.stage <= new.stage and n.id <> new.id)) then
    raise exception 'Node học trước phải cùng môn và không nằm ở chặng sau.';
  end if;
  if exists (select 1 from public.nodes n where new.id = any (n.deps) and n.stage < new.stage) then
    raise exception 'Không chuyển được chặng: có Node ở chặng trước đang phụ thuộc Node này.';
  end if;
  if exists (
    with recursive up (id) as (
      select unnest(new.deps)
      union
      select d from up join public.nodes n on n.id = up.id cross join lateral unnest(n.deps) d
    ) select 1 from up where up.id = new.id
  ) then
    raise exception 'Các Node học trước đang tạo thành vòng lặp.';
  end if;
  return new;
end $$;

create or replace function public.drop_node_deps() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.nodes set deps = array_remove(deps, old.id) where old.id = any (deps);
  return old;
end $$;

drop trigger if exists check_node on public.nodes;
create trigger check_node before insert or update on public.nodes for each row execute function public.check_node();
drop trigger if exists drop_node_deps on public.nodes;
create trigger drop_node_deps after delete on public.nodes for each row execute function public.drop_node_deps();

-- ---------------------------------------------------------------------------
-- 3. Đóng góp và thông báo
-- ---------------------------------------------------------------------------

create table if not exists public.contributions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  node_id       text references public.nodes (id) on delete set null,
  title         text not null check (length(title) between 4 and 160),
  note          text not null default '' check (length(note) <= 600),
  url           text check (url ~* '^https?://' and length(url) <= 1000),
  file_path     text check (length(file_path) <= 300),
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text not null default '' check (length(reject_reason) <= 300),
  reviewer_id   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  check ((url is null) <> (file_path is null))
);
create index if not exists contributions_user on public.contributions (user_id, created_at desc);
create index if not exists contributions_status on public.contributions (status, reviewed_at desc);

create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('reply', 'question', 'contribution', 'review', 'report')),
  title      text not null,
  body       text not null default '',
  link       text not null default '',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user on public.notifications (user_id, id desc);

alter table public.schools enable row level security;
alter table public.majors enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_majors enable row level security;
alter table public.nodes enable row level security;
alter table public.resources enable row level security;
alter table public.course_guides enable row level security;
alter table public.lecturers enable row level security;
alter table public.exams enable row level security;
alter table public.contributions enable row level security;
alter table public.notifications enable row level security;
revoke all on public.schools, public.majors, public.profiles, public.courses, public.course_majors, public.nodes, public.resources,
  public.course_guides, public.lecturers, public.exams, public.contributions, public.notifications from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Vai trò
-- ---------------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
$$;

create or replace function kizuna.require_admin() returns uuid
language plpgsql stable set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  if not public.is_admin() then raise exception 'Chỉ quản trị viên thực hiện được thao tác này.'; end if;
  return uid;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Thông báo
-- ---------------------------------------------------------------------------

create or replace function kizuna.notify(p_user uuid, p_kind text, p_title text, p_body text, p_link text) returns void
language sql volatile set search_path = '' as $$
  insert into public.notifications (user_id, kind, title, body, link) values (p_user, p_kind, p_title, left(p_body, 200), p_link)
$$;

create or replace function kizuna.notify_admins(p_except uuid, p_kind text, p_title text, p_body text, p_link text) returns void
language sql volatile set search_path = '' as $$
  insert into public.notifications (user_id, kind, title, body, link)
  select p.user_id, p_kind, p_title, left(p_body, 200), p_link from public.profiles p where p.role = 'admin' and p.user_id is distinct from p_except
$$;

create or replace function public.on_reply() returns trigger
language plpgsql security definer set search_path = '' as $$
declare q public.questions;
begin
  select * into q from public.questions where id = new.question_id;
  if q.user_id is not null and q.user_id is distinct from new.user_id then
    perform kizuna.notify(q.user_id, 'reply', 'Câu hỏi của bạn có phản hồi mới', coalesce(nullif(q.title, ''), new.body), 'community/' || q.id);
  end if;
  return new;
end $$;

create or replace function public.on_question() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not new.demo then
    perform kizuna.notify_admins(new.user_id, 'question', 'Có câu hỏi mới', coalesce(nullif(new.title, ''), nullif(new.body, ''), 'Câu hỏi chưa có tiêu đề'), 'community/' || new.id);
  end if;
  return new;
end $$;

create or replace function public.on_contribution() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform kizuna.notify_admins(new.user_id, 'contribution', 'Có tài liệu chờ duyệt', new.title, 'admin/review');
  elsif old.status = 'pending' and new.status = 'approved' then
    perform kizuna.notify(new.user_id, 'review', 'Tài liệu của bạn đã được duyệt', new.title, 'contribute/mine');
  elsif old.status = 'pending' and new.status = 'rejected' then
    perform kizuna.notify(new.user_id, 'review', 'Tài liệu của bạn chưa được duyệt', coalesce(nullif(new.reject_reason, ''), new.title), 'contribute/mine');
  end if;
  return new;
end $$;

create or replace function public.on_report() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform kizuna.notify_admins(new.user_id, 'report', 'Có báo cáo nội dung', new.reason, 'admin/reports');
  return new;
end $$;

drop trigger if exists on_reply on public.replies;
create trigger on_reply after insert on public.replies for each row execute function public.on_reply();
drop trigger if exists on_question on public.questions;
create trigger on_question after insert on public.questions for each row execute function public.on_question();
drop trigger if exists on_contribution on public.contributions;
create trigger on_contribution after insert or update of status on public.contributions for each row execute function public.on_contribution();
drop trigger if exists on_report on public.reports;
create trigger on_report after insert on public.reports for each row execute function public.on_report();

create or replace function public.my_notifications() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  return jsonb_build_object(
    'unread', (select count(*) from public.notifications n where n.user_id = uid and n.read_at is null),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'kind', x.kind, 'title', x.title, 'body', x.body, 'link', x.link,
        'read', x.read_at is not null, 'createdAt', x.created_at) order by x.id desc)
      from (select * from public.notifications n where n.user_id = uid order by n.id desc limit 30) x), '[]'::jsonb));
end $$;

-- p_ids = null nghĩa là tất cả.
create or replace function public.read_notifications(p_ids bigint[]) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  update public.notifications set read_at = now() where user_id = uid and read_at is null and (p_ids is null or id = any (p_ids));
end $$;

-- ---------------------------------------------------------------------------
-- 6. Hồ sơ và nội dung cho người dùng
-- ---------------------------------------------------------------------------

create or replace function public.get_me() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  insert into public.profiles (user_id) values (uid) on conflict do nothing;
  return (select jsonb_build_object('role', p.role, 'displayName', p.display_name, 'majorId', p.major_id, 'studyYear', p.study_year,
      'points', 10 * (select count(*) from public.contributions c where c.user_id = uid and c.status = 'approved'))
    from public.profiles p where p.user_id = uid);
end $$;

create or replace function public.save_profile(p_display_name text, p_major_id text, p_study_year int) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); clean text := regexp_replace(btrim(coalesce(p_display_name, '')), '\s+', ' ', 'g');
begin
  if length(clean) not between 2 and 40 then raise exception 'Tên hiển thị cần từ 2 đến 40 ký tự.'; end if;
  if not exists (select 1 from public.majors m where m.id = p_major_id) then raise exception 'Hãy chọn ngành học.'; end if;
  if p_study_year is null or p_study_year not between 1 and 6 then raise exception 'Hãy chọn năm học.'; end if;
  insert into public.profiles (user_id, display_name, major_id, study_year) values (uid, clean, p_major_id, p_study_year)
  on conflict (user_id) do update set display_name = excluded.display_name, major_id = excluded.major_id, study_year = excluded.study_year;
end $$;

create or replace function public.load_content() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); admin boolean := public.is_admin();
begin
  return (
    with c as (select * from public.courses where published or admin)
    select jsonb_build_object(
      'schools', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) order by s.sort, s.name) from public.schools s), '[]'::jsonb),
      'majors', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'schoolId', m.school_id, 'name', m.name) order by m.sort, m.id) from public.majors m), '[]'::jsonb),
      'courses', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'code', c.code, 'name', c.name, 'short', c.short, 'icon', c.icon,
          'color', c.color, 'soft', c.soft, 'published', c.published,
          'majors', coalesce((select jsonb_agg(jsonb_build_object('major', cm.major_id, 'year', cm.study_year) order by cm.major_id)
            from public.course_majors cm where cm.course_id = c.id), '[]'::jsonb)) order by c.code) from c), '[]'::jsonb),
      'nodes', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'courseId', n.course_id, 'stage', n.stage, 'title', n.title, 'deps', to_jsonb(n.deps),
          'summary', n.summary, 'pitfall', n.pitfall, 'flash', n.flash,
          'resources', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'url', r.url, 'filePath', r.file_path, 'by', p.display_name) order by r.sort, r.created_at)
            from public.resources r left join public.profiles p on p.user_id = r.contributor_id where r.node_id = n.id), '[]'::jsonb)
        ) order by n.stage, n.sort, n.created_at) from public.nodes n join c on c.id = n.course_id), '[]'::jsonb),
      'lecturers', coalesce((select jsonb_object_agg(x.course_id, x.list) from (
          select l.course_id, jsonb_agg(l.data || jsonb_build_object('id', l.id) order by l.sort, l.id) as list
          from public.lecturers l join c on c.id = l.course_id group by l.course_id) x), '{}'::jsonb),
      'guides', coalesce((select jsonb_object_agg(g.course_id, g.data) from public.course_guides g join c on c.id = g.course_id), '{}'::jsonb),
      'exams', coalesce((select jsonb_object_agg(x.course_id, x.terms) from (
          select e.course_id, jsonb_object_agg(e.term, e.data) as terms from public.exams e join c on c.id = e.course_id group by e.course_id) x), '{}'::jsonb)
    )
  );
end $$;

-- ---------------------------------------------------------------------------
-- 7. Đóng góp tài liệu
-- ---------------------------------------------------------------------------

create or replace function public.submit_contribution(p_node_id text, p_title text, p_note text, p_url text, p_file_path text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user(); new_id uuid; v_url text := nullif(btrim(coalesce(p_url, '')), ''); v_file text := nullif(btrim(coalesce(p_file_path, '')), '');
begin
  if not exists (select 1 from public.nodes n join public.courses c on c.id = n.course_id where n.id = p_node_id and c.published) then raise exception 'Hãy chọn chủ đề cho tài liệu.'; end if;
  if length(btrim(coalesce(p_title, ''))) < 4 then raise exception 'Tên tài liệu cần ít nhất 4 ký tự.'; end if;
  if (v_url is null) = (v_file is null) then raise exception 'Hãy gửi một liên kết hoặc một tệp.'; end if;
  if v_url is not null and v_url !~* '^https?://' then raise exception 'Liên kết phải bắt đầu bằng http:// hoặc https://'; end if;
  if v_file is not null and (v_file not like uid::text || '/%' or not exists (
      select 1 from storage.objects o where o.bucket_id = 'contributions' and o.name = v_file)) then raise exception 'Chưa tải được tệp lên. Hãy thử lại.'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text, 3));
  if (select count(*) from public.contributions c where c.user_id = uid and c.status = 'pending') >= 10 then
    raise exception 'Bạn đang có 10 tài liệu chờ duyệt. Hãy đợi duyệt bớt rồi gửi tiếp.';
  end if;
  if v_url is not null and exists (select 1 from public.resources r where r.node_id = p_node_id and lower(r.url) = lower(v_url)) then
    raise exception 'Liên kết này đã có trong chủ đề.';
  end if;
  insert into public.contributions (user_id, node_id, title, note, url, file_path)
  values (uid, p_node_id, left(btrim(p_title), 160), left(btrim(coalesce(p_note, '')), 600), v_url, v_file) returning id into new_id;
  return new_id;
end $$;

create or replace function public.my_contributions() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'nodeId', x.node_id, 'title', x.title, 'url', x.url, 'filePath', x.file_path,
      'status', x.status, 'reason', x.reject_reason, 'createdAt', x.created_at) order by x.created_at desc)
    from (select * from public.contributions c where c.user_id = uid order by c.created_at desc limit 100) x), '[]'::jsonb);
end $$;

-- Mỗi tài liệu được duyệt = 10 điểm. Tháng tính theo giờ Việt Nam.
create or replace function public.leaderboard(p_period text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_user();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('rank', r.rank, 'name', r.name, 'count', r.total, 'points', r.total * 10, 'mine', r.user_id = uid) order by r.rank, r.name)
    from (select * from (
        select c.user_id, coalesce(p.display_name, 'Ẩn danh') as name, count(*) as total, rank() over (order by count(*) desc) as rank
        from public.contributions c join public.profiles p on p.user_id = c.user_id
        where c.status = 'approved' and (p_period is distinct from 'month'
          or c.reviewed_at >= date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')
        group by c.user_id, p.display_name) ranked
      where ranked.rank <= 20 or ranked.user_id = uid limit 60) r), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- 8. Quản trị
-- ---------------------------------------------------------------------------

create or replace function public.admin_pending() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform kizuna.require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'nodeId', c.node_id, 'title', c.title, 'note', c.note, 'url', c.url,
      'filePath', c.file_path, 'by', coalesce(p.display_name, 'Chưa đặt tên'), 'createdAt', c.created_at) order by c.created_at)
    from public.contributions c left join public.profiles p on p.user_id = c.user_id where c.status = 'pending'), '[]'::jsonb);
end $$;

create or replace function public.admin_review(p_id uuid, p_approve boolean, p_node_id text, p_title text, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_admin(); c public.contributions;
begin
  select * into c from public.contributions where id = p_id for update;
  if c.id is null or c.status <> 'pending' then raise exception 'Tài liệu này đã được xử lý.'; end if;
  if p_approve then
    if not exists (select 1 from public.nodes n where n.id = p_node_id) then raise exception 'Hãy chọn chủ đề để đăng tài liệu.'; end if;
    if length(btrim(coalesce(p_title, ''))) < 2 then raise exception 'Tên tài liệu không được trống.'; end if;
    insert into public.resources (node_id, title, url, file_path, contributor_id, sort)
    values (p_node_id, left(btrim(p_title), 160), c.url, c.file_path, c.user_id, 1000);
  elsif length(btrim(coalesce(p_reason, ''))) < 4 then
    raise exception 'Hãy ghi lý do từ chối để người gửi biết.';
  end if;
  update public.contributions set status = case when p_approve then 'approved' else 'rejected' end,
    node_id = case when p_approve then p_node_id else node_id end,
    reject_reason = case when p_approve then '' else left(btrim(p_reason), 300) end,
    reviewer_id = uid, reviewed_at = now() where id = p_id;
end $$;

create or replace function public.admin_save_course(p jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare v_id text := nullif(p ->> 'id', '');
begin
  perform kizuna.require_admin();
  if v_id is null then
    v_id := left(btrim(regexp_replace(lower(coalesce(p ->> 'code', '')), '[^a-z0-9]+', '-', 'g'), '-'), 30);
    if v_id !~ '^[a-z0-9-]{2,30}$' then raise exception 'Mã môn cần ít nhất 2 ký tự chữ hoặc số.'; end if;
    if exists (select 1 from public.courses c where c.id = v_id) then raise exception 'Đã có môn dùng mã này.'; end if;
  end if;
  if length(btrim(coalesce(p ->> 'name', ''))) < 2 then raise exception 'Hãy nhập tên môn.'; end if;
  insert into public.courses (id, code, name, short, icon, color, soft, published)
  values (v_id, upper(btrim(p ->> 'code')), btrim(p ->> 'name'), left(btrim(coalesce(p ->> 'short', '')), 200), coalesce(p ->> 'icon', 'book'),
    coalesce(p ->> 'color', '#5978d8'), coalesce(p ->> 'soft', '#eaf0ff'), coalesce((p ->> 'published')::boolean, true))
  on conflict (id) do update set code = excluded.code, name = excluded.name, short = excluded.short, icon = excluded.icon,
    color = excluded.color, soft = excluded.soft, published = excluded.published;
  delete from public.course_majors cm where cm.course_id = v_id;
  insert into public.course_majors (course_id, major_id, study_year)
  select distinct on (x.m ->> 'major') v_id, x.m ->> 'major', (x.m ->> 'year')::smallint
  from jsonb_array_elements(coalesce(p -> 'majors', '[]'::jsonb)) with ordinality x (m, pos)
  where x.m ->> 'major' in (select mj.id from public.majors mj) order by x.m ->> 'major', x.pos;
  return v_id;
end $$;

create or replace function public.admin_save_node(p jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare v_id text := nullif(p ->> 'id', ''); v_course text := p ->> 'courseId';
begin
  perform kizuna.require_admin();
  if not exists (select 1 from public.courses c where c.id = v_course) then raise exception 'Không tìm thấy môn học.'; end if;
  if length(btrim(coalesce(p ->> 'title', ''))) < 2 then raise exception 'Hãy nhập tên Node.'; end if;
  if exists (select 1 from public.nodes n where n.id = v_id and n.course_id <> v_course) then raise exception 'Không chuyển được Node sang môn khác.'; end if;
  if v_id is null then v_id := v_course || '-' || substr(md5(gen_random_uuid()::text), 1, 8); end if;
  insert into public.nodes (id, course_id, stage, title, deps, summary, pitfall, flash, sort)
  values (v_id, v_course, coalesce((p ->> 'stage')::smallint, 0), btrim(p ->> 'title'),
    coalesce((select array_agg(distinct d) from jsonb_array_elements_text(coalesce(p -> 'deps', '[]'::jsonb)) d), '{}'),
    btrim(coalesce(p ->> 'summary', '')), btrim(coalesce(p ->> 'pitfall', '')), coalesce(p -> 'flash', '[]'::jsonb),
    coalesce((select max(n.sort) + 1 from public.nodes n where n.course_id = v_course), 0))
  on conflict (id) do update set stage = excluded.stage, title = excluded.title, deps = excluded.deps,
    summary = excluded.summary, pitfall = excluded.pitfall, flash = excluded.flash;
  delete from public.resources r where r.node_id = v_id and r.id::text not in (
    select x ->> 'id' from jsonb_array_elements(coalesce(p -> 'resources', '[]'::jsonb)) x where x ->> 'id' is not null);
  update public.resources r set title = btrim(x.item ->> 'title'), sort = x.pos,
    url = case when r.file_path is null then nullif(btrim(x.item ->> 'url'), '') end
  from jsonb_array_elements(coalesce(p -> 'resources', '[]'::jsonb)) with ordinality x (item, pos) where r.node_id = v_id and r.id::text = x.item ->> 'id';
  insert into public.resources (node_id, title, url, file_path, sort)
  select v_id, btrim(x.item ->> 'title'), case when nullif(x.item ->> 'filePath', '') is null then nullif(btrim(x.item ->> 'url'), '') end, nullif(x.item ->> 'filePath', ''), x.pos
  from jsonb_array_elements(coalesce(p -> 'resources', '[]'::jsonb)) with ordinality x (item, pos) where x.item ->> 'id' is null;
  return v_id;
end $$;

-- p_kind: 'lecturer' (p_key = id, trống nếu thêm mới), 'guide', 'exam' (p_key = mid | final).
create or replace function public.admin_save_item(p_kind text, p_course_id text, p_key text, p_data jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform kizuna.require_admin();
  if p_kind = 'lecturer' then
    if nullif(p_key, '') is null then
      insert into public.lecturers (course_id, data, sort) values (p_course_id, p_data - 'id', coalesce((select max(l.sort) + 1 from public.lecturers l where l.course_id = p_course_id), 0));
    else
      update public.lecturers set data = p_data - 'id' where id = p_key::uuid and course_id = p_course_id;
    end if;
  elsif p_kind = 'guide' then
    insert into public.course_guides (course_id, data) values (p_course_id, p_data) on conflict (course_id) do update set data = excluded.data;
  elsif p_kind = 'exam' then
    insert into public.exams (course_id, term, data) values (p_course_id, p_key, p_data) on conflict (course_id, term) do update set data = excluded.data;
  else
    raise exception 'Loại nội dung không hợp lệ.';
  end if;
end $$;

create or replace function public.admin_delete(p_kind text, p_id text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform kizuna.require_admin();
  if p_kind = 'course' then delete from public.courses where id = p_id;
  elsif p_kind = 'node' then delete from public.nodes where id = p_id;
  elsif p_kind = 'lecturer' then delete from public.lecturers where id = p_id::uuid;
  else raise exception 'Loại nội dung không hợp lệ.';
  end if;
end $$;

create or replace function public.admin_hide(p_kind text, p_id text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform kizuna.require_admin();
  if p_kind = 'question' then update public.questions set hidden = true where id = p_id;
  elsif p_kind = 'reply' then update public.replies set hidden = true where id = p_id;
  else raise exception 'Loại nội dung không hợp lệ.';
  end if;
end $$;

create or replace function public.admin_reports() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform kizuna.require_admin();
  return coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'questionId', x.question_id, 'title', x.title, 'body', x.body, 'reason', x.reason, 'hidden', x.hidden, 'createdAt', x.created_at) order by x.id desc)
    from (select r.id, r.question_id, q.title, q.body, r.reason, q.hidden, r.created_at from public.reports r join public.questions q on q.id = r.question_id order by r.id desc limit 100) x), '[]'::jsonb);
end $$;

create or replace function public.admin_users() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := kizuna.require_admin();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'email', x.email, 'name', x.display_name, 'majorId', x.major_id, 'year', x.study_year,
      'role', coalesce(x.role, 'user'), 'me', x.id = uid) order by (x.role = 'admin') desc nulls last, x.email)
    from (select u.id, u.email, p.display_name, p.major_id, p.study_year, p.role from auth.users u left join public.profiles p on p.user_id = u.id limit 500) x), '[]'::jsonb);
end $$;

create or replace function public.admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := kizuna.require_admin();
begin
  if p_user = uid then raise exception 'Bạn không tự đổi vai trò của mình được.'; end if;
  if p_role is null or p_role not in ('user', 'admin') then raise exception 'Vai trò không hợp lệ.'; end if;
  insert into public.profiles (user_id, role) values (p_user, p_role) on conflict (user_id) do update set role = excluded.role;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Kho tệp (riêng tư, tối đa 10 MB, chỉ PDF và ảnh)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contributions', 'contributions', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Mỗi người chỉ ghi vào thư mục mang mã của mình, tối đa 20 tệp mỗi ngày.
create or replace function public.can_upload(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and p_name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}\.(pdf|png|jpg)$')
    and (select count(*) from storage.objects o where o.bucket_id = 'contributions' and o.name like auth.uid()::text || '/%' and o.created_at > now() - interval '1 day') < 20
$$;

-- Xem được tệp khi: là chủ tệp, là admin, hoặc tệp đã được đăng trong môn đang mở.
create or replace function public.can_read_file(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    p_name like auth.uid()::text || '/%' or public.is_admin() or exists (
      select 1 from public.resources r join public.nodes n on n.id = r.node_id join public.courses c on c.id = n.course_id
      where r.file_path = p_name and c.published))
$$;

drop policy if exists "hustree upload" on storage.objects;
create policy "hustree upload" on storage.objects for insert to authenticated with check (bucket_id = 'contributions' and public.can_upload(name));
drop policy if exists "hustree read" on storage.objects;
create policy "hustree read" on storage.objects for select to authenticated using (bucket_id = 'contributions' and public.can_read_file(name));
drop policy if exists "hustree admin delete" on storage.objects;
create policy "hustree admin delete" on storage.objects for delete to authenticated using (bucket_id = 'contributions' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 10. Quyền gọi hàm
-- ---------------------------------------------------------------------------

revoke all on function kizuna.require_admin(), kizuna.notify(uuid, text, text, text, text), kizuna.notify_admins(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.check_node(), public.drop_node_deps(), public.on_reply(), public.on_question(), public.on_contribution(), public.on_report() from public, anon, authenticated;
revoke all on function public.is_admin(), public.can_upload(text), public.can_read_file(text), public.my_notifications(), public.read_notifications(bigint[]),
  public.get_me(), public.save_profile(text, text, int), public.load_content(), public.submit_contribution(text, text, text, text, text), public.my_contributions(),
  public.leaderboard(text), public.admin_pending(), public.admin_review(uuid, boolean, text, text, text), public.admin_save_course(jsonb), public.admin_save_node(jsonb),
  public.admin_save_item(text, text, text, jsonb), public.admin_delete(text, text), public.admin_hide(text, text), public.admin_reports(), public.admin_users(),
  public.admin_set_role(uuid, text) from public, anon, authenticated;
grant execute on function public.is_admin(), public.can_upload(text), public.can_read_file(text), public.my_notifications(), public.read_notifications(bigint[]),
  public.get_me(), public.save_profile(text, text, int), public.load_content(), public.submit_contribution(text, text, text, text, text), public.my_contributions(),
  public.leaderboard(text), public.admin_pending(), public.admin_review(uuid, boolean, text, text, text), public.admin_save_course(jsonb), public.admin_save_node(jsonb),
  public.admin_save_item(text, text, text, jsonb), public.admin_delete(text, text), public.admin_hide(text, text), public.admin_reports(), public.admin_users(),
  public.admin_set_role(uuid, text) to authenticated;
