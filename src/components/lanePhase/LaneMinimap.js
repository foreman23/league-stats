import React from 'react';

// Summoner's Rift minimap for the kill-feed panel. Drops a numbered pin at each
// kill/objective's real game position; pins are hover-linked to the feed rows
// (hovering either side highlights the pair and dims the rest).
//
// Riot game coordinates have origin (0,0) at the bottom-left (blue base) and
// grow up/right; the map image origin is top-left, so y is flipped.
const MAP_MAX = 14870;

function pinColor(k) {
  if (k.type === 'monster') return '#C9A227';
  if (k.type === 'tower') return '#9AA1AD';
  return k.side === 'blue' ? '#568CFF' : '#A35BFF';
}

export default function LaneMinimap({ kills, hoveredIndex, onHover }) {
  const active = hoveredIndex != null;
  return (
    <div className="lpr-kf-map">
      <img className="lpr-kf-map-img" src="/images/srMinimap.png" alt="Summoner's Rift" />
      {kills.map((k, i) => {
        const pos = k.position;
        if (!pos || pos.x == null || pos.y == null) return null;
        const left = Math.max(0, Math.min(100, (pos.x / MAP_MAX) * 100));
        const top = Math.max(0, Math.min(100, (1 - pos.y / MAP_MAX) * 100));
        const isOn = hoveredIndex === i;
        return (
          <span
            key={i}
            className={'lpr-kf-pin' + (isOn ? ' lpr-on' : '') + (active && !isOn ? ' lpr-dim' : '')}
            style={{ left: `${left}%`, top: `${top}%`, '--lpr-pin': pinColor(k) }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
          >
            {i + 1}
          </span>
        );
      })}
    </div>
  );
}
