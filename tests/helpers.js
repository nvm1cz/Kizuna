/** Môi trường trình duyệt tối thiểu và backend giả để chạy app.js trong node:test. */
import {seedContent} from '../supabase/seed/index.js';

export const user = {id: '00000000-0000-4000-8000-000000000001', email: 'an@example.com'};
export const settle = () => new Promise(resolve => setTimeout(resolve, 20));

export const student = {role: 'user', displayName: 'An', majorId: 'IT1', studyYear: 4, points: 0};

export function fakeBackend({signedIn = null, remote = {}, questions = [], me = student, notices = {unread: 0, items: []}, pending = [], content = seedContent()} = {}) {
  const calls = [];
  let handler = () => {};
  const log = (name, result) => async (...args) => { calls.push([name, ...args]); return typeof result === 'function' ? result(...args) : result; };
  const backend = {
    calls, offline: false,
    remote: {progress: {}, answers: {}, guideChecks: {}, ...remote},
    emit: (event, who) => handler(event, who),
    onAuth(fn) { handler = fn; setTimeout(() => fn('INITIAL_SESSION', signedIn), 0); },
    signIn: log('signIn', email => { if (email !== user.email) throw Object.assign(new Error('Email hoặc mật khẩu không đúng.'), {code: 'invalid_credentials'}); handler('SIGNED_IN', user); }),
    signUp: log('signUp', 'confirm'),
    signOut: log('signOut', () => handler('SIGNED_OUT', null)),
    sendReset: log('sendReset'), resendConfirm: log('resendConfirm'), setPassword: log('setPassword'),
    async loadStudy() { if (backend.offline) throw Error('offline'); return structuredClone(backend.remote); },
    async saveProgress(uid, entries) { if (backend.offline) throw Error('offline'); calls.push(['saveProgress', uid, entries]); Object.assign(backend.remote.progress, Object.fromEntries(entries)); },
    async saveState(uid, data) { if (backend.offline) throw Error('offline'); calls.push(['saveState', uid]); Object.assign(backend.remote, structuredClone(data)); },
    community: async () => ({questions, replies: [], nodeCounts: {}, myEmpathy: []}),
    ask: log('ask', q => { questions.push({id: 'q' + questions.length, ...q, alias: 'Mèo Tò Mò', createdAt: new Date().toISOString(), empathyCount: 0}); }),
    me: async () => ({...backend.profile}),
    profile: me,
    content: async () => { if (backend.offline) throw Error('Chưa kết nối được máy chủ. Hãy thử lại.'); return structuredClone(content); },
    saveProfile: log('saveProfile', p => Object.assign(backend.profile = {...backend.profile}, {displayName: p.name, majorId: p.major, studyYear: p.year})),
    notifications: async () => structuredClone(notices),
    readNotifications: log('readNotifications'),
    upload: log('upload', (uid, file) => `${uid}/${file.name}`), fileUrl: log('fileUrl', path => 'https://kho/' + path),
    submitContribution: log('submitContribution'), myContributions: async () => [], leaderboard: async () => [{rank: 1, name: 'Bình <b>', count: 3, points: 30, mine: false}],
    pending: async () => structuredClone(pending), reports: async () => [], users: async () => [],
    review: log('review'), saveCourse: log('saveCourse', 'it9999'), saveNode: log('saveNode', 'net-moi'), saveItem: log('saveItem'), remove: log('remove'), hide: log('hide'), setRole: log('setRole'),
    reply: log('reply'), empathize: log('empathize'), report: log('report'), feedback: log('feedback')
  };
  return backend;
}

export function fakeBrowser(hash, {elements = {}, stored = {}} = {}) {
  const handlers = {}, store = new Map(Object.entries(stored)), app = {innerHTML: ''};
  globalThis.localStorage = {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k)};
  globalThis.location = {hash};
  globalThis.window = {scrollY: 0, scrollTo() {}, confirm: () => true, dispatchEvent() {}, addEventListener: (k, v) => { handlers['window:' + k] = v; }};
  globalThis.document = {
    body: {style: {}}, querySelector: () => null, querySelectorAll: () => [],
    getElementById: id => id === 'app' ? app : elements[id] || null,
    addEventListener: (k, v) => { handlers[k] = v; }
  };
  globalThis.requestAnimationFrame = () => {};
  return {handlers, store, app};
}

export async function boot(hash, {user: signedIn = null, options, remote, questions, me, notices, pending, ...env} = {}) {
  const {handlers, store, app} = fakeBrowser(hash, env);
  const backend = fakeBackend({signedIn, remote, questions, me, notices, pending});
  const {start} = await import('../public/js/app/app.js');
  start(backend, options);
  await settle();
  return {
    app, handlers, store, backend, settle,
    go: next => { location.hash = next; handlers['window:hashchange'](); },
    click: dataset => handlers.click({target: {closest: () => ({dataset})}}),
    async submit(id, values, dataset = {}) {
      globalThis.FormData = class { get(key) { return values[key] ?? null; } getAll(key) { return [values[key] ?? []].flat(); } };
      await handlers.submit({target: {id, dataset, querySelector: () => ({disabled: false}), reset() {}}, preventDefault() {}});
      await settle();
    }
  };
}
