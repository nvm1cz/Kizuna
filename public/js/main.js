/** Điểm khởi động: nối Supabase vào ứng dụng. */
import {SUPABASE_URL, SUPABASE_KEY} from './config.js';
import {configProblem, createBackend} from './services/backend.js';
import {start, showSetup} from './app/app.js';

const url = SUPABASE_URL.trim(), key = SUPABASE_KEY.trim();
const problem = configProblem(url, key, globalThis.supabase);

if (problem) {
  showSetup(problem);
} else {
  // Liên kết trong email trả kết quả ở phần # của địa chỉ, cần đọc trước khi Supabase xóa đi.
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const linkError = params.get('error_code') || params.get('error');
  if (linkError) history.replaceState(null, '', location.pathname);
  const client = globalThis.supabase.createClient(url, key, {auth: {flowType: 'implicit', detectSessionInUrl: true}});
  start(createBackend(client, location.origin + '/'), {linkError, recovery: params.get('type') === 'recovery'});
}
