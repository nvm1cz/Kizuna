/** Môi trường trình duyệt tối thiểu và backend giả để chạy app.js trong node:test. */
export const user = {id: '00000000-0000-4000-8000-000000000001', email: 'an@example.com'};
export const settle = () => new Promise(resolve => setTimeout(resolve, 20));

export function fakeBackend({signedIn = null, remote = {}, questions = []} = {}) {
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
    reply: log('reply'), empathize: log('empathize'), report: log('report'), feedback: log('feedback')
  };
  return backend;
}

export function fakeBrowser(hash, {elements = {}, stored = {}} = {}) {
  const handlers = {}, store = new Map(Object.entries(stored)), app = {innerHTML: ''};
  globalThis.localStorage = {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k)};
  globalThis.location = {hash};
  globalThis.window = {scrollY: 0, scrollTo() {}, confirm: () => true, addEventListener: (k, v) => { handlers['window:' + k] = v; }};
  globalThis.document = {
    body: {style: {}}, querySelector: () => null, querySelectorAll: () => [],
    getElementById: id => id === 'app' ? app : elements[id] || null,
    addEventListener: (k, v) => { handlers[k] = v; }
  };
  globalThis.requestAnimationFrame = () => {};
  return {handlers, store, app};
}

export async function boot(hash, {user: signedIn = null, options, remote, questions, ...env} = {}) {
  const {handlers, store, app} = fakeBrowser(hash, env);
  const backend = fakeBackend({signedIn, remote, questions});
  const {start} = await import('../public/js/app/app.js');
  start(backend, options);
  await settle();
  return {
    app, handlers, store, backend, settle,
    go: next => { location.hash = next; handlers['window:hashchange'](); },
    click: dataset => handlers.click({target: {closest: () => ({dataset})}}),
    async submit(id, values) {
      globalThis.FormData = class { get(key) { return values[key] ?? null; } };
      await handlers.submit({target: {id, querySelector: () => ({disabled: false}), reset() {}}, preventDefault() {}});
      await settle();
    }
  };
}
