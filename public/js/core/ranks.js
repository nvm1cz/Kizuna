/** Danh hiệu theo điểm đóng góp. Mỗi tài liệu được duyệt = 10 điểm. */
export const RANKS = [[0, 'Hạt giống'], [10, 'Mầm'], [30, 'Chồi'], [80, 'Cây'], [200, 'Cổ thụ']];
export const POINTS_PER_DOC = 10;

export const rankOf = points => RANKS.findLast(([min]) => points >= min)[1];

/** Danh hiệu kế tiếp và số điểm còn thiếu. Null nếu đã cao nhất. */
export function nextRank(points) {
  const next = RANKS.find(([min]) => min > points);
  return next ? {name: next[1], missing: next[0] - points} : null;
}
