/** Việc cần làm mỗi khi vào một trang: tải dữ liệu riêng của trang đó. */
import {state} from '../core/store.js';
import {loadAdmin} from './admin-flow.js';
import {focusQuestion, showFocusedQuestion} from './community-flow.js';
import {loadContribute} from './contribute-flow.js';
import {render} from './render.js';

export function enterRoute() {
  if (state.phase !== 'in') return;
  focusQuestion();
  if (state.focusQuestion) {
    render(false);
    showFocusedQuestion();
  }
  if (state.route === 'contribute') loadContribute();
  if (state.route === 'admin') loadAdmin();
}
