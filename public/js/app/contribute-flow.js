/** Luồng đóng góp: gửi tài liệu, xem bài đã gửi, mở tệp. */
import {state} from '../core/store.js';
import {contributeTab} from '../views/contribute.js';
import {notify, render} from './render.js';
import {runtime} from './runtime.js';

export async function loadContribute() {
  const uid = state.user?.id;
  if (contributeTab() !== 'mine') return;
  try {
    state.contribute.mine = await runtime.backend.myContributions();
  } catch (e) {
    return notify(e.message, true);
  }
  if (state.user?.id === uid && state.route === 'contribute') render();
}

/** Mở cửa sổ ngay khi bấm (tránh bị chặn popup), rồi mới xin đường dẫn tạm. */
export async function openFile(path) {
  const tab = window.open('', '_blank');
  if (tab) tab.opener = null;
  try {
    const url = await runtime.backend.fileUrl(path);
    if (tab) tab.location = url;
    else notify('Trình duyệt đang chặn cửa sổ mới. Hãy cho phép rồi thử lại.', true);
  } catch (e) {
    tab?.close();
    notify(e.message, true);
  }
}

export const contributeSubmits = {
  'contribute-form': async form => {
    const value = key => String(form.get(key) || '').trim(), file = form.get('file');
    const item = {nodeId: value('nodeId'), title: value('title'), note: value('note')};
    if (value('kind') === 'file') {
      if (!file?.size) throw Error('Hãy chọn một tệp.');
      item.filePath = await runtime.backend.upload(state.user.id, file);
    } else {
      if (!/^https?:\/\//i.test(value('url'))) throw Error('Liên kết phải bắt đầu bằng http:// hoặc https://');
      item.url = value('url');
    }
    await runtime.backend.submitContribution(item);
    location.hash = '#/contribute/mine';
    notify('Đã gửi. Bạn sẽ nhận thông báo khi được duyệt.');
  }
};
