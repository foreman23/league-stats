import React, { useState } from 'react';
import { championImg } from '../api/ddragon';
import { setHoveredLane, useHoveredLane } from '../hooks/useLaneHover';
import StyledTooltip from './StyledTooltip';

// Hover card for the summary lane phrases/chips: a header naming the lane and
// its verdict, then the viewer's side stacked above the opponent's (losing
// side dimmed), each player a ringed champ portrait + name/champion + their
// KDA and CS at 15. BOTTOM is a 2v2 (two player rows per side).

const TEAM_COLOR = { 100: '#568CFF', 200: '#A35BFF' };
// lighter team tints for text on the dark tooltip surface
const TEAM_TEXT = { 100: '#8FB8FF', 200: '#C9A6FF' };
const LANE_LABEL = { TOP: 'Top lane', JUNGLE: 'Jungle', MIDDLE: 'Mid lane', BOTTOM: 'Bot lane' };

const fmtGold = (g) => (Math.abs(g) >= 1000 ? `${(Math.abs(g) / 1000).toFixed(1)}k` : String(Math.abs(g)));

// Lane stats are sampled at 15:00 — or end of game for shorter matches.
const atClock = (gameData) => {
  const secs = Math.min(900, gameData?.info?.gameDuration || 900);
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
};

function PlayerRow({ player, champsJSON, dataDragonVersion, platformId }) {
  const champ = Object.values(champsJSON.data).find(
    (c) => c.key === String(player.championId)
  );
  return (
    <a
      className="lmt-row"
      href={`/profile/${platformId}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}
    >
      <img
        className="lmt-ic"
        style={{ borderColor: TEAM_COLOR[player.teamId] || '#888' }}
        src={championImg(dataDragonVersion, champ?.id)}
        alt={champ?.name || 'champion'}
      />
      <span className="lmt-id">
        <span className="lmt-name" style={{ color: TEAM_TEXT[player.teamId] || '#fff' }}>{player.riotIdGameName}</span>
        <span className="lmt-champ">{champ?.name}</span>
      </span>
      <span className="lmt-stats">
        <span className="lmt-kda">{player.kdaAlt}</span>
        <span className="lmt-cs">{player.cs} CS</span>
      </span>
    </a>
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
  // Participate in the shared lane-hover store (bubbles <-> lane chips).
  // Pass false when another instance for the same role exists on the page
  // (e.g. the lede's lane phrase), or hovering one would open both.
  hoverSync = true,
  // The viewed player's teamId — their side renders on top of the comparison.
  viewerTeam = 100,
}) {
  const lane = lanes?.[role];
  const platformId = gameData?.info?.platformId?.toLowerCase();

  // Controlled open state: selfOpen mirrors MUI's own trigger-hover behavior
  // (including hovering into the tooltip content), while the shared hover store
  // also opens the tooltip when this lane's bubble in BubblesSummary is hovered.
  const [selfOpen, setSelfOpen] = useState(false);
  const hoveredLane = useHoveredLane();

  const hoverProps = hoverSync ? {
    onMouseEnter: () => setHoveredLane(role),
    onMouseLeave: () => setHoveredLane(null),
  } : {};

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
  // viewer's side on top regardless of who won; dim whichever side lost
  const winnersAreViewer = (winners[0]?.teamId ?? 100) === viewerTeam;
  const topSide = winnersAreViewer ? winners : losers;
  const bottomSide = winnersAreViewer ? losers : winners;
  const topLost = !tied && !winnersAreViewer;
  const bottomLost = !tied && winnersAreViewer;
  // Tint the phrase with the winning team's color so it's clear at a glance
  // which team won the lane (neutral when the lane was even).
  const wonColor = tied ? undefined : TEAM_COLOR[lane.teamWonLane];
  const wonTeamWord = lane.teamWonLane === 100 ? 'Blue' : 'Purple';

  const content = (
    <span className="lmt">
      <span className="lmt-head">
        <span className="lmt-lane">{LANE_LABEL[role] || role} @ {atClock(gameData)}</span>
        {tied ? (
          <span className="lmt-res">Dead even</span>
        ) : (
          <span className="lmt-res" style={{ color: TEAM_TEXT[lane.teamWonLane] }}>
            {wonTeamWord} +{fmtGold(lane.goldDifference)} gold
          </span>
        )}
      </span>
      <span className={'lmt-side' + (topLost ? ' lmt-lost' : '')}>
        {topSide.map((p, i) => (
          <PlayerRow key={`t${i}`} player={p} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} platformId={platformId} />
        ))}
      </span>
      <span className="lmt-vs">vs</span>
      <span className={'lmt-side' + (bottomLost ? ' lmt-lost' : '')}>
        {bottomSide.map((p, i) => (
          <PlayerRow key={`b${i}`} player={p} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} platformId={platformId} />
        ))}
      </span>
    </span>
  );

  return (
    <StyledTooltip
      placement="top"
      title={content}
      open={selfOpen || (hoverSync && hoveredLane === role)}
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
