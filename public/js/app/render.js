/** Chọn trang theo địa chỉ (#/...) và vẽ ra màn hình. */
import {state, courseIds, nodeIds} from '../core/store.js';
import {authPage} from '../views/auth.js';
import {communityPage} from '../views/community.js';
import {coursePage} from '../views/course/index.js';
import {helpPage} from '../views/help.js';
import {homePage} from '../views/home.js';
import {nodePage} from '../views/node.js';
import {shell} from '../views/shell.js';
import {failedPage, notFound, setupPage, splash} from '../views/system.js';
import {drawEdges} from './map-edges.js';

const APP = document.getElementById('app');

function currentPage() {
  const [route, id] = state.segments;
  if (['home', 'courses', 'my'].includes(route)) return homePage(); // 'courses', 'my': link của bản cũ
  if (route === 'course' && courseIds.has(id)) return coursePage(id);
  if (route === 'node' && nodeIds.has(id)) return nodePage(id);
  return (new Map([['community', communityPage], ['help', helpPage]]).get(route) || notFound)();
}

export function render(keepScroll = true) {
  const top = keepScroll ? window.scrollY : 0;
  const bits = (location.hash || '#/home').replace(/^#\/?/, '').split('/').filter(Boolean);
  state.segments = bits.length ? bits : ['home'];
  state.route = state.segments[0];
  const page = {in: () => shell(currentPage()), out: authPage, recovery: authPage, setup: setupPage, failed: failedPage}[state.phase] || splash;
  APP.innerHTML = page();
  document.body.style.overflow = state.modal ? 'hidden' : '';
  requestAnimationFrame(() => { drawEdges(); if (keepScroll) window.scrollTo(0, top); });
}

export function notify(text, bad = false) {
  const host = document.querySelector('.toast-stack');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' is-error' : '');
  el.textContent = text;
  host.append(el);
  setTimeout(() => el.remove(), 4200);
}

/* ---------- Hộp thoại ---------- */

export function openModal(type, data = {}) {
  state.modal = {type, ...data};
  render();
  requestAnimationFrame(() => document.querySelector('.modal input:not([type=hidden]),.modal textarea')?.focus());
}
export const closeModal = () => { state.modal = null; render(); };
