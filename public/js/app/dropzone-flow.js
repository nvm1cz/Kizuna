/** Luồng chọn tệp: hiện tên tệp, báo lỗi ngay, nhận kéo thả. */
import {FILE_TYPES, MAX_FILE} from '../services/backend.js';

const size = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** Lý do tệp không dùng được, hoặc chuỗi rỗng. */
export const fileProblem = file => !FILE_TYPES[file.type] ? 'Chỉ nhận tệp PDF, PNG hoặc JPG.' : file.size > MAX_FILE ? 'Tệp lớn hơn 10 MB.' : '';

export function showPicked(input) {
  const zone = input.closest('.dropzone'), file = input.files?.[0], problem = file ? fileProblem(file) : '';
  if (problem) input.value = '';
  zone.classList.toggle('has-file', Boolean(file) && !problem);
  zone.classList.toggle('has-error', Boolean(problem));
  zone.querySelector('[data-drop-title]').textContent = file && !problem ? file.name : 'Chọn tệp hoặc kéo thả vào đây';
  zone.querySelector('[data-drop-hint]').textContent = problem || (file ? size(file.size) : 'PDF, PNG hoặc JPG, tối đa 10 MB');
  zone.querySelector('[data-drop-button]').textContent = file && !problem ? 'Đổi tệp' : 'Chọn tệp';
}

const zoneOf = ev => ev.target.closest?.('.dropzone');

document.addEventListener('dragover', ev => {
  const zone = zoneOf(ev);
  if (!zone) return;
  ev.preventDefault();
  zone.classList.add('is-over');
});
document.addEventListener('dragleave', ev => {
  const zone = zoneOf(ev);
  if (zone && !zone.contains(ev.relatedTarget)) zone.classList.remove('is-over');
});
document.addEventListener('drop', ev => {
  const zone = zoneOf(ev);
  if (!zone) return;
  ev.preventDefault();
  zone.classList.remove('is-over');
  if (!ev.dataTransfer.files.length) return;
  const input = zone.querySelector('input'), one = new DataTransfer();
  one.items.add(ev.dataTransfer.files[0]);
  input.files = one.files;
  showPicked(input);
});
