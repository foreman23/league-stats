import { useSyncExternalStore } from 'react';

// Tiny shared store for "which lane is currently hovered", linking the
// short-summary lane phrases (LaneMatchupTooltip) and the BubblesSummary lane
// bubbles even though the two live in distant parts of the tree: hovering a
// phrase dims the other bubbles, and hovering a bubble pops that lane's
// matchup tooltip. Value is a role string ('TOP'|'JUNGLE'|'MIDDLE'|'BOTTOM')
// or null.

let hoveredLane = null;
const listeners = new Set();

export function setHoveredLane(lane) {
  if (hoveredLane === lane) return;
  hoveredLane = lane;
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return hoveredLane;
}

export function useHoveredLane() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
