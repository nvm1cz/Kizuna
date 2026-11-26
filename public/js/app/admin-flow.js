/** Luồng quản trị: duyệt tài liệu, sửa nội dung, ẩn bài, cấp quyền. Quyền thật do database kiểm tra. */
import {setCatalog} from '../core/catalog.js';
import {isAdmin, state} from '../core/store.js';
import {adminTab} from '../views/admin/index.js';
import {collect, draftFields, fieldAt, newItem} from '../views/admin/editor.js';
import {SPECS} from '../views/admin/specs.js';
import {loadCommunity} from './community-flow.js';
import {fileProblem} from './dropzone-flow.js';
import {loadRanking} from './ranking-flow.js';
import {notify, render} from './render.js';
import {runtime} from './runtime.js';

const LOADERS = {review: ['pending', 'pending'], reports: ['reports', 'reports'], users: ['users', 'users']};

export async function loadAdmin() {
  if (!isAdmin()) return;
  const loader = LOADERS[adminTab()], uid = state.user?.id;
  if (!loader) return;
  try {
    const data = await runtime.backend[loader[0]]();
    if (state.user?.id !== uid) return;
    state.admin[loader[1]] = data;
  } catch (e) {
    return notify(e.message, true);
  }
  if (state.route === 'admin' && !state.admin.draft) render();
}

const refreshContent = async () => setCatalog(await runtime.backend.content());

/* ---------- Bản nháp trong trình sửa ---------- */

const form = () => document.getElementById('editor-form');
/** Giữ lại những gì đang gõ trước khi vẽ lại biểu mẫu. */
function keepTyping() {
  const el = form();
  if (el) state.admin.draft.data = collect(state.admin.draft, new FormData(el));
}
const listAt = path => path.split('.').reduce((value, key) => value[key], state.admin.draft.data);

function editList(path, change) {
  keepTyping();
  change(listAt(path));
  render();
}

export function pickFile(path, file) {
  if (!file || !state.admin.draft) return;
  if (fileProblem(file)) return notify(fileProblem(file), true);
  keepTyping();
  listAt(path).file = file;
  render();
}

function openEditor(el) {
  const {kind, key = ''} = el.dataset, courseId = state.segments[2] || null;
  const spec = SPECS[kind];
  state.admin.draft = {kind, key, courseId, isNew: !key, data: spec.load(key, courseId)};
  render(false);
  window.scrollTo(0, 0);
}

function closeEditor() {
  state.admin.draft = null;
  render(false);
}

async function run(task, done) {
  if (state.busy) return;
  state.busy = true;
  try {
    await task();
    if (done) notify(done);
  } catch (e) {
    notify(e.message, true);
  } finally {
    state.busy = false;
  }
}

export const adminActions = {
  'edit': openEditor,
  'close-editor': () => { if (window.confirm('Bỏ các thay đổi chưa lưu?')) closeEditor(); },
  'list-add': el => {
    const field = fieldAt(draftFields(state.admin.draft), el.dataset.path);
    editList(el.dataset.path, list => list.push(newItem(field)));
  },
  'list-remove': el => editList(el.dataset.path, list => list.splice(Number(el.dataset.index), 1)),
  'list-move': el => editList(el.dataset.path, list => { const i = Number(el.dataset.index); if (i > 0) list.splice(i - 1, 0, ...list.splice(i, 1)); }),
  'drop-file': el => { keepTyping(); delete listAt(el.dataset.path).file; render(); },
  'start-reject': el => { state.admin.rejecting = el.dataset.id; render(); },
  'cancel-reject': () => { state.admin.rejecting = null; render(); },
  'delete': el => {
    const {kind, id, name} = el.dataset;
    const warn = kind === 'course' ? `Xóa môn “${name}” cùng toàn bộ Node, tài liệu, đề thi của môn?` : `Xóa “${name}”?`;
    if (!window.confirm(`${warn} Không khôi phục được.`)) return;
    return run(async () => {
      await runtime.backend.remove(kind, id);
      await refreshContent();
      if (kind === 'course') location.hash = '#/admin/content';
      render();
    }, 'Đã xóa.');
  },
  'hide': el => {
    if (!window.confirm('Ẩn nội dung này với mọi người dùng?')) return;
    return run(async () => {
      await runtime.backend.hide(el.dataset.kind, el.dataset.id);
      if (state.route === 'admin') await loadAdmin();
      await loadCommunity(true);
    }, 'Đã ẩn.');
  },
  'set-role': el => {
    const grant = el.dataset.role === 'admin';
    if (!window.confirm(grant ? 'Cấp quyền quản trị cho người này? Họ sẽ sửa, xóa được mọi nội dung.' : 'Gỡ quyền quản trị của người này?')) return;
    return run(async () => {
      await runtime.backend.setRole(el.dataset.id, el.dataset.role);
      await loadAdmin();
    }, 'Đã đổi vai trò.');
  }
};

export const adminSubmits = {
  'editor-form': async data => {
    const {draft} = state.admin, spec = SPECS[draft.kind];
    draft.data = collect(draft, data);
    spec.check?.(draft.data);
    for (const r of draft.kind === 'node' ? draft.data.resources : []) {
      if (r.file) {
        r.filePath = await runtime.backend.upload(state.user.id, r.file);
        delete r.file;
      }
      if (!r.filePath && !/^https?:\/\//i.test(r.url || '')) throw Error(`Tài liệu “${r.title}” cần một liên kết http(s) hoặc một tệp.`);
    }
    const [method, ...args] = spec.save(draft.data, draft);
    const id = await runtime.backend[method](...args);
    await refreshContent();
    state.admin.draft = null;
    if (draft.kind === 'course' && draft.isNew) location.hash = `#/admin/content/${id}`;
    render(false);
    notify('Đã lưu.');
  },
  'review': async (data, el) => {
    const approve = data.get('decision') !== 'reject', value = key => String(data.get(key) || '').trim();
    await runtime.backend.review({id: el.dataset.id, approve, nodeId: value('nodeId'), title: value('title'), reason: value('reason')});
    state.admin.rejecting = null;
    if (approve) await refreshContent();
    await loadAdmin();
    loadRanking();
    notify(approve ? 'Đã đăng tài liệu.' : 'Đã gửi lý do cho người đóng góp.');
  }
};
