import { React, useState } from 'react';
import { championImg, itemImg } from '../api/ddragon';
import { Grid, Box, Typography } from '@mui/material';
import StyledTooltip from './StyledTooltip';
import SummonerName from './SummonerName';

// Builds — modernized to the shared design system (white card, circular
// team-ring portraits, Q/W/E/R skill grid, item path as soft chips).
// Same data contract as before: buildData.skillTimeline / itemTimeline /
// champInfo, indexed by participantId - 1.

const clock = (ms) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

const SKILLS = [
  { slot: 1, letter: 'Q' },
  { slot: 2, letter: 'W' },
  { slot: 3, letter: 'E' },
  { slot: 4, letter: 'R' },
];

function champEntry(champsJSON, championId) {
  return Object.values(champsJSON.data).find((c) => c.key === String(championId));
}

// One selectable champion portrait: circular, team ring, level badge.
// The viewed player's portrait carries a small "YOU" badge.
function ChampButton({ p, selected, isMe, version, champsJSON, onClick }) {
  const entry = champEntry(champsJSON, p.championId);
  return (
    <StyledTooltip disableInteractive arrow placement="top" title={`${p.riotIdGameName} — ${entry?.name}`}>
      <button
        className={'bd-pick' + (selected ? ' bd-active' : '') + (isMe ? ' bd-me' : '')}
        style={{ '--bd-ring': p.teamId === 100 ? '#568CFF' : '#A35BFF' }}
        onClick={onClick}
        aria-pressed={selected}
      >
        <img className="bd-pick-img" src={championImg(version, entry?.id)} alt={entry?.name} />
        <span className="bd-pick-level">{p.champLevel}</span>
        {isMe && <span className="bd-pick-you">You</span>}
      </button>
    </StyledTooltip>
  );
}

// Q/W/E/R rows x 18 level columns. A filled cell = that skill was taken at
// that champion level; ults get the dark emphasis.
function SkillGrid({ events, spells, version }) {
  const bySlot = {};
  events.forEach((ev, i) => { bySlot[`${ev.skillSlot}-${i + 1}`] = true; });
  return (
    <div className="bd-skill-scroll">
      <div className="bd-skill-grid">
        {SKILLS.map(({ slot, letter }) => {
          const spell = spells?.[slot - 1];
          return (
            <div className="bd-skill-row" key={slot}>
              <div className="bd-skill-head">
                {spell ? (
                  <StyledTooltip disableInteractive arrow placement="top" title={spell.name}>
                    <img
                      className="bd-skill-icon"
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`}
                      alt={spell.name}
                    />
                  </StyledTooltip>
                ) : (
                  <span className="bd-skill-icon bd-skill-icon-empty" />
                )}
                <span className={'bd-skill-key bd-k-' + letter.toLowerCase()}>{letter}</span>
              </div>
              {Array.from({ length: 18 }, (_, i) => {
                const taken = bySlot[`${slot}-${i + 1}`];
                return (
                  <span
                    key={i}
                    className={'bd-cell' + (taken ? (slot === 4 ? ' bd-on bd-ult' : ' bd-on') : '')}
                  >
                    {taken ? i + 1 : ''}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The purchase path: chip per buy-group with a timestamp, chevrons between.
function ItemPath({ history, version, items }) {
  return (
    <div className="bd-path">
      {history.map((group, gi) => (
        <div className="bd-path-seg" key={gi}>
          <div className="bd-step">
            <div className="bd-step-items">
              {group.map((it, ii) => (
                <StyledTooltip
                  key={ii}
                  disableInteractive
                  arrow
                  placement="top"
                  title={<><u>{items.data[it.itemId]?.name}</u><br />{items.data[it.itemId]?.plaintext || items.data[it.itemId]?.tags?.[0]}</>}
                >
                  <img className="bd-item" src={itemImg(version, it.itemId)} alt={items.data[it.itemId]?.name || 'item'} />
                </StyledTooltip>
              ))}
            </div>
            <span className="bd-step-time">{clock(group[0].timestamp)}</span>
          </div>
          {gi !== history.length - 1 && (
            <svg className="bd-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          )}
        </div>
      ))}
    </div>
  );
}

const Builds = (props) => {
  const { playerData, gameData, dataDragonVersion, champsJSON, items, buildData } = props;

  const [cur, setCur] = useState(playerData);
  const pid = cur.participantId - 1;
  const entry = champEntry(champsJSON, cur.championId);
  const spells = buildData.champInfo[pid]?.data?.[entry?.id]?.spells;
  const skillEvents = buildData.skillTimeline[pid].filter((ev) => ev.type === 'SKILL_LEVEL_UP');

  const blue = gameData.info.participants.filter((p) => p.teamId === 100);
  const purple = gameData.info.participants.filter((p) => p.teamId === 200);
  // Viewer's team renders first, mirroring the rest of the page.
  const teams = playerData.teamId === 200 ? [purple, blue] : [blue, purple];

  return (
    <Grid className="GameDetailsContainer" container justifyContent={'center'} margin={'auto'} marginTop={'20px'} marginBottom={'10px'}>
      {/* 65% of GameDetailsContainer — the same nesting the other sections get
          (.StandoutContainer / #DetailsAnchor / .sb-wrap), so card widths match. */}
      <div className="bd-wrap">
      <Box className="BuildsBox gameSectionHeader">
        <Typography className="gameSectionHeading">Builds</Typography>
        <Typography className="gameSectionSubheading">Player Items & Level Ups</Typography>
      </Box>
      <div className="bd-card">
        <div className="bd-who">
          <SummonerName participant={cur} version={dataDragonVersion} platformId={gameData.info.platformId} className="bd-name">
            {cur.riotIdGameName}
          </SummonerName>
          <span className="bd-champ">{entry?.name}</span>
        </div>

        <div className="bd-picker">
          {teams.map((team, ti) => (
            <div className="bd-team" key={ti}>
              {team.map((p) => (
                <ChampButton
                  key={p.participantId}
                  p={p}
                  selected={p.participantId === cur.participantId}
                  isMe={p.participantId === playerData.participantId}
                  version={dataDragonVersion}
                  champsJSON={champsJSON}
                  onClick={() => setCur(p)}
                />
              ))}
            </div>
          ))}
        </div>

        <h4 className="bd-subhead">Skill Order</h4>
        <SkillGrid events={skillEvents} spells={spells} version={dataDragonVersion} />

        <h4 className="bd-subhead">Item Build</h4>
        <ItemPath history={buildData.itemTimeline[pid].itemHistory} version={dataDragonVersion} items={items} />
      </div>
      </div>
    </Grid>
  );
};

export default Builds;
