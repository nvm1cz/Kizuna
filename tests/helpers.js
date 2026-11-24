/** Môi trường trình duyệt tối thiểu để chạy app.js trong node:test. */
export async function boot(hash, {fetch = async () => ({ok: false}), elements = {}} = {}) {
  const handlers = {}, store = new Map(), app = {innerHTML: ''};
  globalThis.localStorage = {getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v)};
  globalThis.location = {hash};
  globalThis.window = {scrollY: 0, scrollTo() {}, addEventListener: (k, v) => { handlers['window:' + k] = v; }};
  globalThis.document = {
    body: {style: {}}, querySelector: () => null, querySelectorAll: () => [],
    getElementById: id => id === 'app' ? app : elements[id] || null,
    addEventListener: (k, v) => { handlers[k] = v; }
  };
  globalThis.requestAnimationFrame = () => {};
  globalThis.fetch = fetch;
  await import('../app.js');
  return {
    app, handlers,
    state: () => JSON.parse(store.get('kizuna-mvp-state-v1')),
    go: next => { location.hash = next; handlers['window:hashchange'](); },
    click: dataset => handlers.click({target: {closest: () => ({dataset})}})
  };
}
