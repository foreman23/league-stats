import React, { useState, useEffect } from 'react';
import { championImg, itemImg, spellImg } from '../api/ddragon';
import StyledTooltip from './StyledTooltip';
import SummonerName from './SummonerName';

// Modernized post-game scoreboard. Same columns/data as before; restyled to the
// shared design system with real Data Dragon art (champ / spells / runes / items).

// Bar reveal — setTimeout (NOT rAF, which is paused in hidden/background iframes
// and would leave the bars at width 0). Visible end-state is the base.
function useGrown() {
  const [g, setG] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setG(true), 60);
    return () => clearTimeout(t);
  }, []);
  return g;
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');
// "UTILITY" is Riot's data value for the support role — display it as "Support".
const roleLabel = (pos) => (pos === 'UTILITY' ? 'Support' : cap(pos));
const tipOffset = { popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } };

function SpellIcon({ id, version, spellsObj }) {
  const sp = spellsObj.find((s) => s.key === String(id));
  if (!sp) return <span className="sb-spell-empty" />;
  return (
    <StyledTooltip disableInteractive arrow placement="top" slotProps={tipOffset}
      title={<><span style={{ textDecoration: 'underline' }}>{sp.name}</span><br /><span style={{ color: '#f2f2f2' }}>{sp.description}</span></>}>
      <img className="sb-spell" src={spellImg(version, sp.id)} alt={sp.name} />
    </StyledTooltip>
  );
}

function Runes({ player, getKeystoneIconUrl, runesObj, version }) {
  const secId = player.perks?.styles?.[1]?.style;
  const sec = runesObj.find((r) => r.id === secId);
  return (
    <>
      <span className="sb-rune sb-rune-key"><img src={getKeystoneIconUrl(player, runesObj)} alt="Keystone" /></span>
      {sec && (
        <StyledTooltip disableInteractive arrow placement="top" slotProps={tipOffset} title={sec.key}>
          <span className="sb-rune sb-rune-sec"><img src={`https://ddragon.leagueoflegends.com/cdn/img/${sec.icon}`} alt={sec.key} /></span>
        </StyledTooltip>
      )}
    </>
  );
}

function ItemSlot({ id, version, items, round }) {
  if (!id || id === 0) {
    if (round) return <img className="sb-trinket" src="/images/blankItem.webp" alt="" />;
    return <span className="sb-item-empty" />;
  }
  const it = items?.data?.[id];
  return (
    <StyledTooltip disableInteractive arrow placement="top" slotProps={tipOffset}
      title={it ? <><span style={{ textDecoration: 'underline' }}>{it.name}</span><br /><span>{it.plaintext || it.tags?.[0]}</span></> : ''}>
      <img className={round ? 'sb-trinket' : 'sb-item'} src={itemImg(version, id)} alt={it?.name || 'item'} />
    </StyledTooltip>
  );
}

function PlayerRow({ player, side, ctx }) {
  const grown = useGrown();
  const { version, champsJSON, items, spellsObj, getKeystoneIconUrl, runesObj, maxDamage, summonerName, playerData, playersWithScores, gameData, aram, urf } = ctx;

  const champ = Object.values(champsJSON.data).find((c) => c.key === String(player.championId));
  const cs = player.totalMinionsKilled + player.neutralMinionsKilled;
  const csm = (cs / (gameData.info.gameDuration / 60)).toFixed(1);
  const ratio = (player.kills + player.assists) / Math.max(1, player.deaths);
  const dmgPct = grown ? Math.max(4, (player.totalDamageDealtToChampions / maxDamage) * 100) : 0;

  const sw = playersWithScores.find((p) => p.puuid === player.puuid);
  const standing = sw?.standing || '';
  const place = parseInt(standing, 10) || 0;
  const placeCls = place === 1 ? ' sb-p1' : place === 2 ? ' sb-p2' : place === 3 ? ' sb-p3' : '';
  const scoreCls = player.score >= 6.5 ? ' sb-hi' : player.score < 5 ? ' sb-lo' : '';
  const isMe = player.riotIdGameName.toLowerCase() === summonerName || playerData.puuid === player.puuid;

  return (
    <div className={'sb-row' + (aram ? ' sb-row--aram' : '') + (isMe ? ' sb-me' : '')}>
      <div className="sb-ident">
        <StyledTooltip disableInteractive arrow placement="top" slotProps={tipOffset} title={champ?.name}>
          <span className="sb-port" style={{ '--sb-ring': side === 'blue' ? '#568CFF' : '#A35BFF' }}>
            <img className="sb-port-img" src={championImg(version, champ?.id)} alt={champ?.name} />
            <span className="sb-level">{player.champLevel}</span>
          </span>
        </StyledTooltip>
        <span className="sb-mini">
          <SpellIcon id={player.summoner1Id} version={version} spellsObj={spellsObj} />
          <SpellIcon id={player.summoner2Id} version={version} spellsObj={spellsObj} />
        </span>
        <span className="sb-mini">
          <Runes player={player} getKeystoneIconUrl={getKeystoneIconUrl} runesObj={runesObj} version={version} />
        </span>
        <span className="sb-nameblock">
          <SummonerName participant={player} version={version} platformId={gameData.info.platformId} className="sb-name">{player.riotIdGameName}</SummonerName>
          <span className="sb-sub">
            {standing && <span className={'sb-place' + placeCls}>{standing}</span>}
            <span className={'sb-score' + scoreCls}>{player.score.toFixed(1)}</span>
          </span>
        </span>
      </div>

      {!aram && !urf && <div className="sb-cell sb-role">{roleLabel(player.teamPosition)}</div>}

      <div className="sb-cell sb-kda">
        <div className="sb-kda-line">{player.kills}<span className="sb-sl">/</span>{player.deaths}<span className="sb-sl">/</span>{player.assists}</div>
        <div className={'sb-kda-ratio' + (ratio >= 4 ? ' sb-good' : '')}>{ratio.toFixed(1)} KDA</div>
      </div>

      <div className="sb-cell sb-dmg">
        <span className="sb-dmg-v">{player.totalDamageDealtToChampions.toLocaleString()}</span>
        <StyledTooltip disableInteractive placement="top" title={<div>AD: {player.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {player.magicDamageDealtToChampions.toLocaleString()}<br />True: {player.trueDamageDealtToChampions.toLocaleString()}</div>}>
          <div className="sb-dmg-bar"><div className="sb-dmg-fill" style={{ width: dmgPct + '%' }} /></div>
        </StyledTooltip>
      </div>

      <div className="sb-cell sb-gold">{player.goldEarned.toLocaleString()}g</div>

      <div className="sb-cell sb-cs"><span className="sb-cs-v">{cs}</span> <span className="sb-cs-m">{csm}/m</span></div>

      {!aram && <div className="sb-cell sb-wards">{player.wardsPlaced}</div>}

      <div className="sb-cell sb-build">
        <div className="sb-build-row">
          <ItemSlot id={player.item0} version={version} items={items} />
          <ItemSlot id={player.item1} version={version} items={items} />
          <ItemSlot id={player.item2} version={version} items={items} />
          <ItemSlot id={player.item6} version={version} items={items} round />
        </div>
        <div className="sb-build-row">
          <ItemSlot id={player.item3} version={version} items={items} />
          <ItemSlot id={player.item4} version={version} items={items} />
          <ItemSlot id={player.item5} version={version} items={items} />
        </div>
      </div>
    </div>
  );
}

function TeamTable({ side, win, players, ctx }) {
  return (
    <div className={'sb-table sb-' + side}>
      <div className="sb-scroll">
        <div className="sb-inner">
          <div className={'sb-header' + (ctx.aram ? ' sb-row--aram' : '')}>
            <div className="sb-team">
              <span className="sb-tn">{side === 'blue' ? 'Blue Team' : 'Purple Team'}</span>
              <span className={'sb-result ' + (win ? 'sb-win' : 'sb-loss')}>
                {win && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                {win ? 'Victory' : 'Defeat'}
              </span>
            </div>
            {!ctx.aram && !ctx.urf && <div className="sb-colh">Role</div>}
            <div className="sb-colh">KDA</div>
            <div className="sb-colh">Damage</div>
            <div className="sb-colh">Gold</div>
            <div className="sb-colh">CS</div>
            {!ctx.aram && <div className="sb-colh sb-c">Wards</div>}
            <div className="sb-colh">Build</div>
          </div>
          {players.map((p, i) => <PlayerRow key={i} player={p} side={side} ctx={ctx} />)}
        </div>
      </div>
    </div>
  );
}

const DetailsTable = (props) => {
  const { playerData, gameData, champsJSON, dataDragonVersion, summonerSpellsObj, summonerName, playersWithScores, getKeystoneIconUrl, runesObj, highestDamageDealt, items } = props;

  const ctx = {
    version: dataDragonVersion, champsJSON, items, spellsObj: summonerSpellsObj,
    getKeystoneIconUrl, runesObj, maxDamage: highestDamageDealt, summonerName,
    playerData, playersWithScores, gameData, aram: props.aram, urf: props.urf,
  };

  const blue = gameData.info.participants.filter((p) => p.teamId === 100);
  const purple = gameData.info.participants.filter((p) => p.teamId === 200);

  const tables = [
    <TeamTable key="blue" side="blue" win={gameData.info.teams[0].win} players={blue} ctx={ctx} />,
    <TeamTable key="purple" side="purple" win={gameData.info.teams[1].win} players={purple} ctx={ctx} />,
  ];
  if (playerData.teamId === 200) tables.reverse(); // viewed player's team first

  return (
    <div className="sb-wrap">
      <div className="sb-head">
        <h2>Match Scoreboard</h2>
        <p className="sb-sub">Per-player results at the end of the game</p>
      </div>
      {tables}
    </div>
  );
};

export default DetailsTable;
