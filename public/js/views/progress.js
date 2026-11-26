/** Thanh tiến độ của một môn. */
import {nodesOf} from '../core/catalog.js';
import {mastered} from '../core/store.js';

export const progressOf = courseId => {
  const list = nodesOf(courseId);
  const done = list.filter(n => mastered(n.id)).length;
  return {done, total: list.length, percent: Math.round(done / list.length * 100)};
};
export const progressBar = ({percent}) => `<span class="bar" aria-hidden="true"><i style="width:${percent}%"></i></span>`;
