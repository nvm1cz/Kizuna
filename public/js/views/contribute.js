/** Trang Đóng góp: gửi tài liệu, theo dõi bài đã gửi, bảng xếp hạng. */
import {getCourse, getNode} from '../core/catalog.js';
import {nextRank, POINTS_PER_DOC, rankOf, RANKS} from '../core/ranks.js';
import {state} from '../core/store.js';
import {courseOptions, documentLink, empty, esc, formatDate, link, topicOptions} from './helpers.js';
import {dropzone} from './dropzone.js';
import {ico} from './icons.js';
import {rankingTab} from './ranking.js';

const TABS = [['send', 'Gửi tài liệu'], ['mine', 'Đã gửi'], ['ranking', 'Bảng xếp hạng']];
const STATUS_TAG = {pending: ['tag-sample', 'Chờ duyệt'], approved: ['tag-ok', 'Đã đăng'], rejected: ['tag-bad', 'Chưa duyệt']};
export const contributeTab = () => TABS.some(([id]) => id === state.segments[1]) ? state.segments[1] : 'send';

function rankCard() {
  const points = state.me?.points || 0, next = nextRank(points), floor = RANKS.findLast(([min]) => points >= min)[0];
  const percent = next ? Math.round((points - floor) / (next.missing + points - floor) * 100) : 100;
  return `<aside class="panel rank-card"><span class="rank-icon">${ico('sprout', 30)}</span><p>Danh hiệu của bạn</p><strong>${rankOf(points)}</strong><span class="bar" aria-hidden="true"><i style="width:${percent}%"></i></span>
    <p>${points} điểm${next ? ` · còn ${next.missing} điểm tới ${next.name}` : ''}</p>
    <ul>${RANKS.map(([min, name]) => `<li class="${points >= min ? 'is-on' : ''}"><span>${name}</span><span>${min} điểm</span></li>`).join('')}</ul>
    <p>Mỗi tài liệu được duyệt cộng ${POINTS_PER_DOC} điểm, kèm tên bạn cạnh tài liệu.</p></aside>`;
}

function sendTab() {
  const node = getNode(state.segments[2]), courseId = node?.courseId || '';
  return `<div class="contribute-layout"><form id="contribute-form" class="panel">
    <div class="field-pair"><div class="field"><label for="cb-course">Môn học</label><select id="cb-course" data-topics="cb-node" required>${courseOptions(courseId)}</select></div>
    <div class="field"><label for="cb-node">Chủ đề</label><select id="cb-node" name="nodeId" required ${courseId ? '' : 'disabled'}>${topicOptions(courseId, node?.id)}</select></div></div>
    <div class="field"><label for="cb-title">Tên tài liệu</label><input id="cb-title" name="title" required minlength="4" maxlength="160"></div>
    <fieldset class="choice"><legend>Loại tài liệu</legend><div class="segmented"><label><input type="radio" name="kind" value="link" checked><span>Liên kết</span></label><label><input type="radio" name="kind" value="file"><span>PDF hoặc ảnh</span></label></div></fieldset>
    <div class="field when-link"><label for="cb-url">Liên kết</label><input id="cb-url" name="url" type="url" maxlength="1000" placeholder="https://"></div>
    <div class="field when-file"><span class="field-label">Tệp</span>${dropzone('cb-file')}</div>
    <div class="field"><label for="cb-note">Vì sao nên dùng tài liệu này?</label><textarea id="cb-note" name="note" maxlength="600"></textarea></div>
    <label class="consent"><input type="checkbox" name="rights" required><span>Tôi được phép chia sẻ tài liệu này và nó không chứa thông tin cá nhân của người khác.</span></label>
    <button type="submit" class="btn btn-primary">${ico('send', 18)} Gửi quản trị viên duyệt</button></form>${rankCard()}</div>`;
}

function mineTab() {
  const list = state.contribute.mine;
  if (!list) return '<p class="note">Đang tải</p>';
  if (!list.length) return empty('gift', 'Bạn chưa gửi tài liệu nào', '', link('contribute', 'btn btn-primary', 'Gửi tài liệu đầu tiên'));
  return `<ul class="rows">${list.map(c => {
    const node = getNode(c.nodeId), [cls, label] = STATUS_TAG[c.status];
    return `<li class="row-item"><div><strong>${esc(c.title)}</strong><p class="sub">${node ? `${esc(getCourse(node.courseId)?.name)} · ${esc(node.title)}` : 'Chủ đề đã bị xóa'} · ${formatDate(c.createdAt)}</p>${c.reason ? `<p class="reason">${esc(c.reason)}</p>` : ''}</div>
      <span class="tag ${cls}">${label}</span>${documentLink(c, 'text-link', `Mở ${ico('external', 15)}`)}</li>`;
  }).join('')}</ul>`;
}

export function contributePage() {
  const tab = contributeTab();
  return `<h1>Đóng góp</h1><nav class="tabs tabs-3" aria-label="Mục đóng góp">${TABS.map(([id, name]) =>
    link(`contribute${id === 'send' ? '' : '/' + id}`, 'tab', name, id === tab ? 'aria-current="page"' : '')).join('')}</nav>${{send: sendTab, mine: mineTab, ranking: rankingTab}[tab]()}`;
}
