import { useSyncExternalStore } from 'react';

// Tiny shared store for "jump to lane card X": the Match Summary lane chips
// and the Lanes → Endgame slope chart request a focus by anchor id, and the
// matching LaneCard dims, scrolls itself into view, and releases the dim once
// the scroll settles (same interaction as the battle cards). `seq` makes
// repeat clicks on the same lane re-fire the effect.

let request = null; // { anchor, seq }
let seq = 0;
const listeners = new Set();

export function focusLaneCard(anchor) {
  request = { anchor, seq: ++seq };
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return request;
}

export function useLaneFocusRequest() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
