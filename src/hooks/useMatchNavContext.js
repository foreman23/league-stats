import { useSyncExternalStore } from 'react';

// Match pages publish their context (viewed player, team, result) here; the
// site Navbar subscribes and morphs into the match context bar once the page
// header scrolls away — one persistent bar instead of a two-bar handoff.

let ctx = null;
const listeners = new Set();

export function setMatchNavContext(next) {
  ctx = next;
  listeners.forEach((l) => l());
}

export function clearMatchNavContext() {
  setMatchNavContext(null);
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMatchNavContext() {
  return useSyncExternalStore(subscribe, () => ctx);
}
