import React, { useState } from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { championImg } from '../api/ddragon';
import { setHoveredLane, useHoveredLane } from '../hooks/useLaneHover';
import StyledTooltip from './StyledTooltip';

// Hover tooltip for the short-summary lane phrases ("lost in top", etc.).
// Renders the lane trigger (<u>) and, on hover, the lane matchup: the winning
// side stacked above the losing side with a "vs" divider, each player shown as a
// team-colored champ icon + summoner name. BOTTOM is a 2v2 (two players per row).

const TEAM_COLOR = { 100: '#568CFF', 200: '#A35BFF' };

function PlayerChip({ player, champsJSON, dataDragonVersion, platformId }) {
  const champ = Object.values(champsJSON.data).find(
    (c) => c.key === String(player.championId)
  );
  return (
    <a
      className="laneMatchupChip"
      href={`/profile/${platformId}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}
    >
      <img
        className="laneMatchupIcon"
        style={{ border: `2px solid ${TEAM_COLOR[player.teamId] || '#888'}` }}
        src={championImg(dataDragonVersion, champ?.id)}
        alt={champ?.name || 'champion'}
      />
      <span className="laneMatchupName">{player.riotIdGameName}</span>
    </a>
  );
}

function MatchupRow({ players, champsJSON, dataDragonVersion, platformId, won, tied }) {
  // Fixed-width outcome slot keeps the champ icons aligned across both rows.
  return (
    <span className={`laneMatchupRow${!tied && !won ? ' laneMatchupRow--lost' : ''}`}>
      <span className="laneMatchupOutcome">
        {won && !tied && (
          <EmojiEventsIcon style={{ fontSize: '14px', color: TEAM_COLOR[players[0]?.teamId] || '#E6B422' }} />
        )}
      </span>
      {players.map((player, i) => (
        <PlayerChip
          key={`${player.riotIdGameName}-${i}`}
          player={player}
          champsJSON={champsJSON}
          dataDragonVersion={dataDragonVersion}
          platformId={platformId}
        />
      ))}
    </span>
  );
}

export default function LaneMatchupTooltip({
  role,
  label,
  lanes,
  gameData,
  champsJSON,
  dataDragonVersion,
  onClick,
}) {
  const lane = lanes?.[role];
  const platformId = gameData?.info?.platformId?.toLowerCase();

  // Controlled open state: selfOpen mirrors MUI's own trigger-hover behavior
  // (including hovering into the tooltip content), while the shared hover store
  // also opens the tooltip when this lane's bubble in BubblesSummary is hovered.
  const [selfOpen, setSelfOpen] = useState(false);
  const hoveredLane = useHoveredLane();

  const hoverProps = {
    onMouseEnter: () => setHoveredLane(role),
    onMouseLeave: () => setHoveredLane(null),
  };

  // No lane data (remakes / missing role / pre-load) — fall back to a plain link.
  if (!lane?.laneWinner || !lane?.laneLoser || !champsJSON || !dataDragonVersion) {
    return (
      <u className="matchSummaryLaneLink" onClick={onClick} {...hoverProps}>
        {label}
      </u>
    );
  }

  const winners = [].concat(lane.laneWinner);
  const losers = [].concat(lane.laneLoser);
  const tied = lane.bubbleCount === 0;
  // Tint the phrase with the winning team's color so it's clear at a glance
  // which team won the lane (neutral when the lane was even).
  const wonColor = tied ? undefined : TEAM_COLOR[lane.teamWonLane];

  const content = (
    <span className="laneMatchupTooltip">
      <MatchupRow players={winners} won tied={tied} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} platformId={platformId} />
      <span className="laneMatchupVs">vs</span>
      <MatchupRow players={losers} tied={tied} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} platformId={platformId} />
    </span>
  );

  return (
    <StyledTooltip
      placement="top"
      title={content}
      open={selfOpen || hoveredLane === role}
      onOpen={() => setSelfOpen(true)}
      onClose={() => setSelfOpen(false)}
      slotProps={{ popper: { modifiers: [{ name: 'preventOverflow', enabled: false }] } }}
    >
      <u className="matchSummaryLaneLink" style={{ color: wonColor }} onClick={onClick} {...hoverProps}>
        {label}
      </u>
    </StyledTooltip>
  );
}
