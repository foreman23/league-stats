// Adapter: shape Riot end-of-game team stats into the `match` view-model the
// redesigned MatchDetails card consumes. Blue (teamId 100) is always left,
// purple (200) right.

import { championImg } from '../../api/ddragon';

function champEntry(id, champsJSON) {
  return Object.values(champsJSON.data).find((c) => c.key === String(id));
}

// key -> { label, cap (realistic max for bar normalization), kind, riot field }
const OBJECTIVE_DEFS = [
  { key: 'grubs', label: 'Void Grubs', cap: 6, kind: 'count', riot: 'horde' },
  { key: 'herald', label: 'Rift Herald', cap: 1, kind: 'binary', riot: 'riftHerald' },
  { key: 'dragons', label: 'Dragons', cap: 6, kind: 'count', riot: 'dragon' },
  { key: 'atakhan', label: 'Atakhan', cap: 1, kind: 'binary', riot: 'atakhan' },
  { key: 'barons', label: 'Barons', cap: 3, kind: 'count', riot: 'baron' },
  { key: 'towers', label: 'Towers', cap: 11, kind: 'count', riot: 'tower' },
  { key: 'inhibs', label: 'Inhibitors', cap: 3, kind: 'count', riot: 'inhibitor' },
];

const objKills = (team, riot) => team?.objectives?.[riot]?.kills || 0;
const teamGold = (participants, teamId) =>
  participants.filter((p) => p.teamId === teamId).reduce((s, p) => s + (p.goldEarned || 0), 0);

function bansOf(team, champsJSON, version) {
  return (team.bans || [])
    .filter((b) => b.championId && b.championId > 0)
    .map((b) => {
      const e = champEntry(b.championId, champsJSON);
      return { champ: e ? e.name : String(b.championId), portrait: e ? championImg(version, e.id) : null };
    });
}

export function toMatchVM(gameData, champsJSON, version) {
  const teams = gameData.info.teams;
  const participants = gameData.info.participants;
  const blueTeam = teams.find((t) => t.teamId === 100) || teams[0];
  const purpleTeam = teams.find((t) => t.teamId === 200) || teams[1];

  const blue = { kills: objKills(blueTeam, 'champion'), gold: teamGold(participants, 100) };
  const purple = { kills: objKills(purpleTeam, 'champion'), gold: teamGold(participants, 200) };

  const objectives = OBJECTIVE_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    cap: def.cap,
    kind: def.kind,
    blue: objKills(blueTeam, def.riot),
    purple: objKills(purpleTeam, def.riot),
  }));

  return {
    winner: blueTeam.win ? 'blue' : 'purple',
    blue,
    purple,
    objectives,
    bans: {
      blue: bansOf(blueTeam, champsJSON, version),
      purple: bansOf(purpleTeam, champsJSON, version),
    },
  };
}
