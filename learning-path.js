/**
 * Quy tắc khóa Node: một Node chỉ mở khi MỌI Node tiên quyết đã mở và được đánh dấu "Đã thông suốt".
 * Hàm thuần, nhận progress ({nodeId: 'explore' | 'stuck' | 'clear'}) để dễ kiểm thử.
 */
import {nodes, getNode} from './data.js';

export const isUnlocked = (id, progress) => {
  const node = getNode(id);
  return Boolean(node) && node.deps.every(dep => isMastered(dep, progress));
};

/** Đã thông suốt và vẫn đang mở (Node tiên quyết chưa bị hạ trạng thái). */
export const isMastered = (id, progress) => progress[id] === 'clear' && isUnlocked(id, progress);

/** Các Node tiên quyết trực tiếp còn thiếu. */
export const missingPrereqs = (id, progress) =>
  (getNode(id)?.deps || []).filter(dep => !isMastered(dep, progress)).map(getNode);

/** Node nên học ngay để tiến tới việc mở khóa id. */
export function nextStepTo(id, progress) {
  const missing = missingPrereqs(id, progress);
  for (const node of missing) if (isUnlocked(node.id, progress)) return node;
  return missing.length ? nextStepTo(missing[0].id, progress) : getNode(id);
}

/** Node học ngay sau id. */
export const followers = id => nodes.filter(node => node.deps.includes(id));
