/** Biểu mẫu sửa nội dung, dựng từ specs.js. Tên ô nhập là đường dẫn dữ liệu, ví dụ "grading.0.label". */
import {state} from '../../core/store.js';
import {esc, options} from '../helpers.js';
import {ACCEPT} from '../dropzone.js';
import {ico} from '../icons.js';
import {SPECS} from './specs.js';

const at = (data, path) => path.split('.').reduce((value, key) => value?.[key], data);
const blankOf = fields => Object.fromEntries(fields.filter(f => f.type === 'list' || f.type === 'group').map(f => [f.key, f.type === 'list' ? [] : blankOf(f.item)]));

export const draftFields = draft => SPECS[draft.kind].fields(draft.courseId, draft.data);

/** Tìm mô tả trường theo đường dẫn, bỏ qua số thứ tự trong danh sách. */
export function fieldAt(fields, path) {
  const keys = path.split('.').filter(k => !/^\d+$/.test(k));
  return keys.reduce((field, key) => (field ? field.item : fields).find(f => f.key === key), null);
}
export const newItem = field => blankOf(field.item);

/* ---------- Dựng biểu mẫu ---------- */

function control(f, path, data) {
  const value = at(data, path), id = `ed-${path.replaceAll('.', '-')}`, req = f.required ? 'required' : '', attrs = `id="${id}" name="${path}" ${req}`;
  const wrap = body => `<div class="field"><label for="${id}">${f.label}</label>${body}${f.hint ? `<small>${f.hint}</small>` : ''}</div>`;
  switch (f.type) {
    case 'area': return wrap(`<textarea ${attrs} maxlength="${f.max}">${esc(value)}</textarea>`);
    case 'url': return wrap(`<input ${attrs} type="url" maxlength="${f.max}" placeholder="https://" value="${esc(value)}">`);
    case 'number': return wrap(`<input ${attrs} type="number" min="${f.min}" max="${f.max}" value="${esc(value)}">`);
    case 'select': return wrap(`<select ${attrs}>${options(f.choices(), value, f.blank ?? (f.required ? 'Chọn' : null))}</select>`);
    case 'lines': return wrap(`<textarea ${attrs}>${esc((value || []).join('\n'))}</textarea>`);
    case 'check': return `<label class="consent"><input type="checkbox" name="${path}" ${value ? 'checked' : ''}><span>${f.label}</span></label>`;
    case 'checks': return `<fieldset class="checks-grid"><legend>${f.label}</legend>${f.choices().map(([v, label]) => `<label><input type="checkbox" name="${path}" value="${esc(v)}" ${value?.includes(v) ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('') || '<p class="muted">Chưa có Node khác trong môn.</p>'}</fieldset>`;
    case 'group': return `<fieldset class="group"><legend>${f.label}</legend>${f.item.map(sub => control(sub, `${path}.${sub.key}`, data)).join('')}</fieldset>`;
    case 'list': return listControl(f, path, data);
    case 'source': return sourceControl(path, data);
    default: return wrap(`<input ${attrs} maxlength="${f.max}" value="${esc(value)}">`);
  }
}

function listControl(f, path, data) {
  const rows = at(data, path) || [];
  return `<fieldset class="group"><legend>${f.label}</legend>${rows.map((_, i) => `<div class="list-row"><div>${f.item.map(sub => control(sub, `${path}.${i}.${sub.key}`, data)).join('')}</div>
    <div class="list-tools"><button type="button" class="icon-btn" aria-label="Đưa lên" data-action="list-move" data-path="${path}" data-index="${i}" ${i ? '' : 'disabled'}>${ico('up', 18)}</button><button type="button" class="icon-btn danger" aria-label="Xóa mục này" data-action="list-remove" data-path="${path}" data-index="${i}">${ico('trash', 18)}</button></div></div>`).join('')}
    <button type="button" class="btn btn-soft" data-action="list-add" data-path="${path}">${ico('plus', 18)} ${f.add}</button></fieldset>`;
}

/** Nguồn của tài liệu: liên kết, hoặc tệp tải lên. */
function sourceControl(path, data) {
  const base = path.replace(/\.source$/, ''), item = at(data, base) || {};
  if (item.filePath) return `<p class="source-file">${ico('file', 18)} Tệp đã tải lên <button type="button" class="text-link" data-action="open-file" data-path="${esc(item.filePath)}">Xem</button></p>`;
  if (item.file) return `<p class="source-file">${ico('file', 18)} ${esc(item.file.name)} <button type="button" class="text-link" data-action="drop-file" data-path="${base}">Bỏ tệp</button></p>`;
  return `<div class="field"><label for="ed-url-${esc(base)}">Liên kết</label><input id="ed-url-${esc(base)}" name="${base}.url" type="url" maxlength="1000" placeholder="https://" value="${esc(item.url)}"></div>
  ${item.id ? '' : `<label class="btn btn-soft file-pick">${ico('upload', 18)} Hoặc chọn tệp PDF, ảnh<input type="file" class="sr-only" data-file-path="${base}" accept="${ACCEPT}"></label>`}`;
}

export function editorPage() {
  const {draft} = state.admin, spec = SPECS[draft.kind];
  return `<div class="narrow"><button type="button" class="back-link" data-action="close-editor">${ico('back', 18)} Quay lại</button><h1>${spec.title(draft.isNew, draft.key)}</h1>
  <form id="editor-form" class="panel editor">${draftFields(draft).map(f => control(f, f.key, draft.data)).join('')}
  <div class="row editor-actions"><button type="submit" class="btn btn-primary">Lưu</button><button type="button" class="btn btn-ghost" data-action="close-editor">Hủy</button></div></form></div>`;
}

/* ---------- Đọc biểu mẫu ---------- */

function readField(f, path, form, data) {
  const raw = () => String(form.get(path) ?? '').trim();
  switch (f.type) {
    case 'number': return Number(raw()) || 0;
    case 'select': return f.number ? Number(raw()) : raw();
    case 'check': return form.get(path) !== null;
    case 'checks': return form.getAll(path);
    case 'lines': return raw().split('\n').map(s => s.trim()).filter(Boolean);
    case 'group': return readAll(f.item, `${path}.`, form, data);
    case 'list': return (at(data, path) || []).map((old, i) => ({...old, ...readAll(f.item, `${path}.${i}.`, form, data)}));
    default: return raw();
  }
}

function readAll(fields, prefix, form, data) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'source') {
      const url = form.get(`${prefix}url`);
      if (url !== null) out.url = String(url).trim();
    } else {
      out[f.key] = readField(f, prefix + f.key, form, data);
    }
  }
  return out;
}

/** Trộn dữ liệu đang gõ vào bản nháp. */
export const collect = (draft, form) => ({...draft.data, ...readAll(draftFields(draft), '', form, draft.data)});
