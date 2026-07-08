import { useSyncExternalStore } from 'react';

// Tiny shared store for "jump to the battle at timestamp X": the Match
// Summary's Key Moment tiles request a focus, and the Battles section (in a
// distant part of the tree) resolves which fight contains that timestamp,
// expands its card, and scrolls to it. `seq` makes repeat clicks on the same
// moment re-fire the effect.

let request = null; // { ms, seq }
let seq = 0;
const listeners = new Set();

export function focusBattleAt(ms) {
  request = { ms, seq: ++seq };
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return request;
}

export function useBattleFocusRequest() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
