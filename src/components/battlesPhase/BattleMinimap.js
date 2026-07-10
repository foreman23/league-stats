import React from 'react';

// Summoner's Rift minimap for a battle: a pin at each kill/objective's real
// position, numbered to match the kill-feed order and hover-linked to it.
// Mirrors the laning-phase minimap. Game coords have origin bottom-left, so y
// is flipped against the (top-left origin) image.
const MAP_MAX = 14870;

// pins follow the acting team; gold only for unattributed events
function pinColor(k) {
  if (k.side === 'blue') return '#568CFF';
  if (k.side === 'purple') return '#A35BFF';
  return '#C9A227';
}

export default function BattleMinimap({ kills, hoveredIndex, onHover }) {
  const active = hoveredIndex != null;
  return (
    <div className="bcr-map">
      <img className="bcr-map-img" src="/images/srMinimap.png" alt="Summoner's Rift" />
      {kills.map((k, i) => {
        const pos = k.position;
        if (!pos || pos.x == null || pos.y == null) return null;
        const left = Math.max(0, Math.min(100, (pos.x / MAP_MAX) * 100));
        const top = Math.max(0, Math.min(100, (1 - pos.y / MAP_MAX) * 100));
        const isOn = hoveredIndex === i;
        return (
          <span
            key={i}
            className={'bcr-pin' + (isOn ? ' bcr-on' : '') + (active && !isOn ? ' bcr-dim' : '')}
            style={{ left: `${left}%`, top: `${top}%`, '--bcr-pin': pinColor(k) }}
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
