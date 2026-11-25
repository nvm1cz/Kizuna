/** Lớp duy nhất nói chuyện với Supabase. Phần còn lại của app không biết tới thư viện này. */

const jwtRole = key => {
  try { return JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role; } catch { return null; }
};

/** Trả về mã lỗi cấu hình, hoặc null nếu dùng được. */
export function configProblem(url, key, library) {
  if (!url || !key) return 'missing';
  if (key.startsWith('sb_secret_') || jwtRole(key) === 'service_role') return 'secret';
  if (!/^https?:\/\/[^/\s]+\/?$/.test(url)) return 'url';
  if (!library?.createClient) return 'library';
  return null;
}

const AUTH_MESSAGES = {
  invalid_credentials: 'Email hoặc mật khẩu không đúng.',
  email_not_confirmed: 'Bạn chưa xác nhận email. Hãy mở thư xác nhận đã gửi.',
  user_already_exists: 'Email này đã được đăng ký. Hãy đăng nhập.',
  email_exists: 'Email này đã được đăng ký. Hãy đăng nhập.',
  email_address_invalid: 'Địa chỉ email không hợp lệ.',
  validation_failed: 'Thông tin chưa hợp lệ. Hãy kiểm tra lại.',
  weak_password: 'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự, có cả chữ và số.',
  same_password: 'Mật khẩu mới phải khác mật khẩu cũ.',
  signup_disabled: 'Hiện chưa mở đăng ký tài khoản mới.',
  email_provider_disabled: 'Đăng nhập bằng email đang tắt.',
  email_address_not_authorized: 'Hệ thống chưa gửi được thư tới địa chỉ này. Hãy báo cho nhóm Kizuna.',
  over_email_send_rate_limit: 'Đã gửi quá nhiều thư. Hãy thử lại sau khoảng một giờ.',
  over_request_rate_limit: 'Bạn thao tác quá nhanh. Hãy thử lại sau ít phút.',
  session_expired: 'Phiên đã hết hạn. Hãy đăng nhập lại.',
  session_not_found: 'Phiên đã hết hạn. Hãy đăng nhập lại.',
  user_banned: 'Tài khoản này đang bị khóa.',
  otp_expired: 'Liên kết đã hết hạn hoặc đã được dùng. Hãy yêu cầu thư mới.'
};
export const authMessage = code => AUTH_MESSAGES[code] || 'Không thực hiện được. Hãy kiểm tra kết nối và thử lại.';

const authError = error => Object.assign(new Error(authMessage(error.code)), {code: error.code});
/** P0001 = lỗi do các hàm SQL của Kizuna chủ động báo, nội dung viết sẵn cho người dùng. */
const dataError = error => new Error(error.code === 'P0001' ? error.message : 'Chưa kết nối được máy chủ. Hãy thử lại.');

const unwrap = (result, toError) => {
  if (result.error) throw toError(result.error);
  return result.data;
};

export function createBackend(client, home) {
  const auth = async promise => unwrap(await promise, authError);
  const data = async promise => unwrap(await promise, dataError);
  const rpc = (name, args) => data(client.rpc(name, args));
  return {
    onAuth: handler => client.auth.onAuthStateChange((event, session) => {
      // Supabase không cho gọi lại chính nó trong callback này, nên phải lùi sang lượt sau.
      setTimeout(() => handler(event, session?.user ? {id: session.user.id, email: session.user.email} : null), 0);
    }),
    /** 'ready' = vào được ngay, 'confirm' = cần mở email, 'exists' = email đã có tài khoản. */
    async signUp(email, password) {
      const {user, session} = await auth(client.auth.signUp({email, password, options: {emailRedirectTo: home}}));
      if (session) return 'ready';
      return user?.identities?.length === 0 ? 'exists' : 'confirm';
    },
    signIn: (email, password) => auth(client.auth.signInWithPassword({email, password})),
    signOut: () => auth(client.auth.signOut({scope: 'local'})),
    sendReset: email => auth(client.auth.resetPasswordForEmail(email, {redirectTo: home})),
    resendConfirm: email => auth(client.auth.resend({type: 'signup', email, options: {emailRedirectTo: home}})),
    setPassword: password => auth(client.auth.updateUser({password})),

    async loadStudy() {
      const [rows, extra] = await Promise.all([
        data(client.from('node_progress').select('node_id,status')),
        data(client.from('study_state').select('answers,guide_checks').maybeSingle())
      ]);
      return {
        progress: Object.fromEntries(rows.map(r => [r.node_id, r.status])),
        answers: extra?.answers || {},
        guideChecks: extra?.guide_checks || {}
      };
    },
    // Gửi kèm user_id để RLS từ chối nếu phiên đã đổi sang người khác giữa chừng.
    saveProgress: (uid, entries) => data(client.from('node_progress')
      .upsert(entries.map(([node_id, status]) => ({user_id: uid, node_id, status})), {onConflict: 'user_id,node_id'})),
    saveState: (uid, {answers, guideChecks}) => data(client.from('study_state')
      .upsert({user_id: uid, answers, guide_checks: guideChecks}, {onConflict: 'user_id'})),

    community: () => rpc('community_snapshot'),
    ask: q => rpc('ask_question', {p_node_id: q.nodeId, p_course_id: q.courseId, p_title: q.title, p_body: q.body}),
    reply: (questionId, body) => rpc('reply_question', {p_question_id: questionId, p_body: body}),
    empathize: (type, id) => rpc('add_empathy', {p_target_type: type, p_target_id: id}),
    report: (questionId, reason) => rpc('report_question', {p_question_id: questionId, p_reason: reason}),
    feedback: (rating, body) => rpc('send_feedback', {p_rating: rating, p_body: body})
  };
}
