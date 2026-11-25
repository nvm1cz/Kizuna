/**
 * Đồng bộ tiến độ: ghi vào máy trước để giao diện phản hồi ngay, rồi đẩy lên Supabase.
 * Mất mạng thì thay đổi nằm trong dirtyNodes/dirtyState và được đẩy lại sau.
 */
import {local, persist, legacyStudy, dropLegacy} from '../core/store.js';

export function createSync(backend, onFail = () => {}) {
  let running = null, timer = null;

  async function pushOnce() {
    const {uid} = local;
    const ids = local.dirtyNodes, withState = local.dirtyState;
    if (!uid || (!ids.length && !withState)) return;
    local.dirtyNodes = [];
    local.dirtyState = false;
    try {
      const entries = ids.filter(id => local.progress[id]).map(id => [id, local.progress[id]]);
      if (entries.length) await backend.saveProgress(uid, entries);
      if (withState) await backend.saveState(uid, {answers: local.answers, guideChecks: local.guideChecks});
    } catch (e) {
      if (local.uid === uid) {
        local.dirtyNodes = [...new Set([...ids, ...local.dirtyNodes])];
        local.dirtyState ||= withState;
        persist();
      }
      throw e;
    }
    if (local.uid === uid) persist();
  }

  async function drain() {
    while (local.uid && (local.dirtyNodes.length || local.dirtyState)) await pushOnce();
  }

  /** Đẩy hết thay đổi đang chờ. Nhiều lời gọi cùng lúc dùng chung một lượt. */
  function flush() {
    clearTimeout(timer);
    running ||= drain().finally(() => { running = null; });
    return running;
  }
  const later = wait => {
    clearTimeout(timer);
    timer = setTimeout(() => flush().catch(onFail), wait);
  };

  return {
    flush,
    nodeChanged(id) {
      if (!local.dirtyNodes.includes(id)) local.dirtyNodes.push(id);
      persist();
      flush().catch(onFail);
    },
    stateChanged() {
      local.dirtyState = true;
      persist();
      later(600);
    },
    /** Lấy dữ liệu tài khoản về. Trả về true nếu vừa chuyển tiến độ cũ trên máy vào tài khoản. */
    async pull() {
      const {uid} = local;
      await flush();
      const remote = await backend.loadStudy();
      if (local.uid !== uid) return false;
      const legacy = Object.keys(remote.progress).length ? null : legacyStudy();
      Object.assign(local, legacy || remote, {synced: true});
      if (legacy) {
        local.dirtyNodes = Object.keys(legacy.progress);
        local.dirtyState = true;
      }
      persist();
      if (!legacy) return false;
      await flush();
      dropLegacy();
      return true;
    }
  };
}
