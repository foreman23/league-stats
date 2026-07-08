// Adapter: pick MVP / 2ND / INT from the match and shape each into the
// view-model the redesigned StandoutsCard consumes. The picking + description
// logic is ported from the original Standout component, parameterized per rank.

import { championImg } from '../../api/ddragon';

function champEntry(championId, champsJSON) {
  return Object.values(champsJSON.data).find((c) => c.key === String(championId));
}

// Generated description for a player at a given rank (ported verbatim, with the
// active-player reference replaced by the passed player/rank).
function describe(rank, player, gameData) {
  const dur = gameData.info.gameDuration;
  let s = '';

  switch (rank) {
    case 'MVP':
      s += `carried the match, ending the game ${player.kills}/${player.deaths}/${player.assists}. `;
      break;
    case '2ND':
      s += `displayed a solid performance, finishing ${player.kills}/${player.deaths}/${player.assists}. `;
      break;
    case 'INT': {
      s += `struggled throughout the match, ending ${player.kills}/${player.deaths}/${player.assists}. `;
      if (player.deaths > Math.ceil(dur / 60) * 0.3) {
        s += `Their frequent deaths made it difficult for their team to recover momentum. `;
      }
      const goldThresholdInt = Math.ceil(((dur / 60) * 500) * 0.7);
      if (player.goldEarned < goldThresholdInt && player.teamPosition !== 'UTILITY') {
        s += `They only earned ${player.goldEarned.toLocaleString()} gold, significantly below the expected amount. `;
      }
      const damageThresholdInt = Math.ceil(((dur / 60) * 900) * 0.5);
      if (player.totalDamageDealtToChampions < damageThresholdInt && player.teamPosition !== 'UTILITY') {
        s += `Their contribution to damage was minimal, dealing just ${player.totalDamageDealtToChampions.toLocaleString()} damage. `;
      }
      break;
    }
    default:
      s += `played the game, finishing with ${player.kills}/${player.deaths}/${player.assists}. `;
      break;
  }

  const goldThreshold = Math.ceil((dur / 60) * 500);
  if (player.goldEarned > goldThreshold) {
    s += `They amassed an impressive ${player.goldEarned.toLocaleString()} gold. `;
  }
  const damageThreshold = Math.ceil((dur / 60) * 900);
  if (player.totalDamageDealtToChampions > damageThreshold) {
    s += `With ${player.totalDamageDealtToChampions.toLocaleString()} damage dealt, they were pivotal in helping the ${player.teamId === 100 ? 'blue' : 'purple'} team dominate teamfights. `;
  }
  const killThreshold = Math.ceil((dur / 60) * 0.5);
  if (player.kills > killThreshold) {
    s += `Their ${player.kills} kills ${player.win ? 'helped to secure a decisive victory' : 'kept their team in contention'} for the ${player.teamId === 100 ? 'blue' : 'purple'} team. `;
  }

  const dragonsTaken = player?.challenges?.dragonTakedowns || 0;
  const baronsTaken = player?.challenges?.baronTakedowns || 0;
  const dragonThreshold = Math.ceil((dur / 60) * 0.1);
  const baronThreshold = Math.ceil((dur / 60) * 0.05);
  if (dragonsTaken > dragonThreshold) {
    s += `They dominated the jungle by securing ${dragonsTaken} dragons, giving their team a strong advantage. `;
  }
  if (baronsTaken > baronThreshold) {
    s += `Their impact was felt in the late game, where they secured ${baronsTaken} Baron Nashor buffs, shifting momentum in their team's favor. `;
  }
  const totalObjectives = dragonsTaken + baronsTaken;
  if (totalObjectives > dragonThreshold + baronThreshold) {
    s += `Overall, they contributed significantly by taking ${totalObjectives} major jungle objectives, leading their team to success. `;
  }
  const kda = ((player.kills + player.assists) / player.deaths).toFixed(1);
  if (kda > 5) {
    s += `They maintained an impressive KDA of ${kda}, showcasing their effectiveness. `;
  }
  return s.trim();
}

function toStandout(player, rank, gameData, champsJSON, version) {
  const entry = champEntry(player.championId, champsJSON);
  const teamKills = gameData.info.participants
    .filter((p) => p.teamId === player.teamId)
    .reduce((sum, p) => sum + p.kills, 0);

  // Split the description: the opening clause is the bolded "lead".
  const desc = describe(rank, player, gameData);
  const ci = desc.indexOf(',');
  const lead = ci > 0 ? desc.slice(0, ci) : '';
  const detail = ci > 0 ? desc.slice(ci + 1).trim() : desc;

  return {
    rank,
    player, // kept for SummonerName (carries riotId, teamId, profileIcon)
    name: player.riotIdGameName,
    champ: entry ? entry.name : 'Unknown Champion',
    portrait: entry ? championImg(version, entry.id) : null,
    side: player.teamId === 100 ? 'blue' : 'purple',
    k: player.kills,
    d: player.deaths,
    a: player.assists,
    kda: +((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(1),
    kp: teamKills ? Math.round(((player.kills + player.assists) / teamKills) * 100) : null,
    summary: { lead, detail },
  };
}

export function buildStandouts(gameData, champsJSON, version) {
  const participants = gameData.info.participants;
  const mvp = participants.reduce((max, p) => (p.score > (max?.score || 0) ? p : max), null);
  const second = participants
    .filter((p) => p !== mvp)
    .reduce((max, p) => (p.score > (max?.score || 0) ? p : max), null);
  const intP = participants.reduce((min, p) => (p.score < (min?.score ?? Infinity) ? p : min), null);

  if (!mvp || !second || !intP) return [];
  return [
    toStandout(mvp, 'MVP', gameData, champsJSON, version),
    toStandout(second, '2ND', gameData, champsJSON, version),
    toStandout(intP, 'INT', gameData, champsJSON, version),
  ];
}
