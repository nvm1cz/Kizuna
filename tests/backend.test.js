import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {configProblem, createBackend, authMessage} from '../public/js/services/backend.js';
import {SUPABASE_KEY} from '../public/js/config.js';

const lib = {createClient() {}};
const jwt = role => `x.${Buffer.from(JSON.stringify({role})).toString('base64url')}.y`;

test('phát hiện cấu hình thiếu hoặc nguy hiểm', () => {
  assert.equal(configProblem('', '', lib), 'missing');
  assert.equal(configProblem('https://a.supabase.co', 'sb_secret_abc', lib), 'secret');
  assert.equal(configProblem('https://a.supabase.co', jwt('service_role'), lib), 'secret');
  assert.equal(configProblem('a.supabase.co', 'sb_publishable_abc', lib), 'url');
  assert.equal(configProblem('https://a.supabase.co', 'sb_publishable_abc', undefined), 'library');
  assert.equal(configProblem('https://a.supabase.co', 'sb_publishable_abc', lib), null);
  assert.equal(configProblem('https://a.supabase.co/', jwt('anon'), lib), null);
  assert.ok(!SUPABASE_KEY || configProblem('https://a.supabase.co', SUPABASE_KEY, lib) === null, 'config.js không được chứa khóa bí mật');
});

test('đổi lỗi Supabase thành thông báo tiếng Việt, không lộ lỗi nội bộ', async () => {
  const client = {
    auth: {
      signInWithPassword: async () => ({data: {}, error: {code: 'invalid_credentials', message: 'Invalid login credentials'}}),
      signUp: async ({email}) => ({data: email === 'cu@x.y' ? {user: {identities: []}, session: null} : {user: {identities: [{}]}, session: email === 'ngay@x.y' ? {} : null}, error: null})
    },
    rpc: async name => ({data: null, error: name === 'ask_question' ? {code: 'P0001', message: 'Bạn vừa gửi một câu hỏi.'} : {code: '42501', message: 'permission denied for table questions'}})
  };
  const backend = createBackend(client, 'http://x/');
  await assert.rejects(backend.signIn('a', 'b'), {message: 'Email hoặc mật khẩu không đúng.', code: 'invalid_credentials'});
  assert.deepEqual([await backend.signUp('cu@x.y', 'p'), await backend.signUp('ngay@x.y', 'p'), await backend.signUp('moi@x.y', 'p')], ['exists', 'ready', 'confirm']);
  await assert.rejects(backend.ask({}), /Bạn vừa gửi/);
  await assert.rejects(backend.community(), /Chưa kết nối được máy chủ/);
  assert.match(authMessage('ma-la'), /Không thực hiện được/);
});

test('schema: mọi bảng bật RLS, hàm định nghĩa quyền đều khóa search_path', async () => {
  const sql = await fs.readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  const tables = [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map(m => m[1]);
  assert.equal(tables.length, 7);
  for (const t of tables) assert.match(sql, new RegExp(`alter table public\\.${t} enable row level security`), t);
  for (const block of sql.split(/create or replace function /).slice(1)) {
    const head = block.split('$$')[0];
    assert.match(head, /set search_path = ''/, head.split('(')[0]);
  }
});
