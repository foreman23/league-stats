import SummonerName from '../components/SummonerName';
import LaneMatchupTooltip from '../components/LaneMatchupTooltip';

// The Match Summary story: a verdict headline, one tight lede paragraph, and a
// row of storyline chips — replacing the old three-bullet template summary.
// Everything is derived from data already on the page: lane results (stats15),
// the team-gold series (graphData), and the match metadata.
//
// Tone contract (see product direction): sports-broadcast — confident but
// friendly, analytical but not sterile. No roast labels, no coaching advice.

// icons for the key-moment tiles, keyed by moment.icon
export const MOMENT_ICONS = {
  blood: <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2s6 7.2 6 12a6 6 0 11-12 0c0-4.8 6-12 6-12z" /></svg>,
  tower: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 21V9l3-2V4h2v3h2V4h2v3l3 2v12M6 21h12M10 21v-4h4v4" /></svg>,
  swing: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>,
  peak: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 5h11.5L14 9l2.5 4H5" /></svg>,
};

const ROLES = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];
const LANE_ANCHOR = {
  TOP: 'laningTopAnchor',
  JUNGLE: 'laningJgAnchor',
  MIDDLE: 'laningMidAnchor',
  BOTTOM: 'laningBotAnchor',
};
const LANE_SHORT = { TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bot' };

const fmtClock = (secs) => `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
const fmtGold = (g) => {
  const a = Math.abs(g);
  return a >= 1000 ? `${(a / 1000).toFixed(1)}k` : String(a);
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const generateMatchStory = (gameData, playerData, stats15, graphData, dataDragonVersion, champsJSON, timelineData) => {
  const lanes = stats15.laneResults;
  const viewerTeam = playerData.teamId;
  const win = playerData.win;
  const teamName = viewerTeam === 100 ? 'Blue' : 'Purple';
  const oppTeamName = viewerTeam === 100 ? 'Purple' : 'Blue';
  const surrendered = gameData.info.participants[0].gameEndedInSurrender === true;
  const endClock = fmtClock(gameData.info.gameDuration);

  // ---- gold arc, viewer-signed (positive = viewer's team ahead) ----
  const minutes = graphData.xAxisGold || [];
  const series = (graphData.yAxisGold || []).map((v) => (viewerTeam === 100 ? v : -v));
  const n = series.length;
  let maxLead = 0, maxLeadIdx = 0, maxDeficit = 0, maxDeficitIdx = 0;
  let aheadMin = 0, behindMin = 0;
  // biggest recovery from a running low — the losing side's "rally"
  let runMin = Infinity, runMinIdx = 0, rallySize = 0, rallyIdx = 0;
  series.forEach((v, i) => {
    if (v > maxLead) { maxLead = v; maxLeadIdx = i; }
    if (v < maxDeficit) { maxDeficit = v; maxDeficitIdx = i; }
    if (v > 0) aheadMin += 1; else if (v < 0) behindMin += 1;
    if (v < runMin) { runMin = v; runMinIdx = i; }
    if (runMin < 0 && v - runMin > rallySize) { rallySize = v - runMin; rallyIdx = runMinIdx; }
  });
  // last minute the lead sign differed from the final sign -> "from X:00 on"
  const finalSign = Math.sign(series[n - 1] ?? 0) || (win ? 1 : -1);
  let lastCross = -1;
  for (let i = n - 1; i >= 0; i--) {
    if (Math.sign(series[i]) !== finalSign) { lastCross = i; break; }
  }
  const fromMin = lastCross === -1 ? null : minutes[Math.min(lastCross + 1, n - 1)];
  const leadChanges = graphData.leadChanges;

  // ---- game archetype (priority order) ----
  const closeGame = n > 0 && Math.abs(aheadMin - behindMin) / n < 0.25;
  const comeback = win && maxDeficit <= -3000;
  const slip = !win && maxLead >= 3000;
  const wire = (win ? behindMin : aheadMin) <= 2;
  const seesaw = leadChanges >= 4;

  let headline;
  if (comeback) headline = 'Down big, won anyway';
  else if (slip) headline = 'Let one slip away';
  else if (wire) headline = win ? 'In control from start to finish' : 'Behind early, never recovered';
  else if (seesaw) headline = win ? 'A seesaw game, won late' : 'A seesaw game, lost late';
  else if (closeGame) headline = win ? 'A dead-even game, edged out' : 'A dead-even game, just short';
  else headline = win ? 'Ahead where it mattered' : 'Chasing it all game';

  // ---- lane aggregation (viewer-framed) ----
  let wonL = 0, lostL = 0, drawL = 0;
  ROLES.forEach((r) => {
    const lr = lanes[r];
    if (lr.resTag === 'draw') drawL += 1;
    else if (lr.teamWonLane === viewerTeam) wonL += 1;
    else lostL += 1;
  });
  // laneOpen is the full start of sentence one — the even cases talk about
  // the laning phase itself rather than the team
  const evenLanes = wonL === lostL;
  let laneOpen;
  if (lostL === 4) laneOpen = `${teamName} dropped all four lanes in the opening`;
  else if (wonL === 4) laneOpen = `${teamName} swept all four lanes in the opening`;
  else if (wonL === 3) laneOpen = `${teamName} took three of four lanes in the opening`;
  else if (lostL === 3) laneOpen = `${teamName} dropped three of four lanes in the opening`;
  else if (drawL === 4) laneOpen = 'The laning phase was dead even in every lane';
  else if (wonL > lostL) laneOpen = `${teamName} came out of the lanes ahead`;
  else if (lostL > wonL) laneOpen = `${teamName} came out of the lanes behind`;
  // not "split the lanes" — reads as split-pushing to a League audience
  else laneOpen = 'The laning phase was even';

  // ---- the viewed player's own matchup, woven into the lane clause ----
  const playerRole = playerData.teamPosition === 'UTILITY' ? 'BOTTOM' : playerData.teamPosition;
  const opp = gameData.info.participants.find(
    (p) => p.teamId !== viewerTeam && p.teamPosition === playerData.teamPosition
  );
  const oppChamp = opp
    ? Object.values(champsJSON.data).find((c) => c.key === String(opp.championId))?.name
    : null;
  const laneNoun = playerRole === 'JUNGLE' ? 'the jungle'
    : playerRole === 'TOP' ? 'top lane'
      : playerRole === 'MIDDLE' ? 'mid lane' : 'bot lane';

  let weave = null;
  if (opp && lanes[playerRole]) {
    const lr = lanes[playerRole];
    const playerWonLane = lr.resTag !== 'draw' && lr.teamWonLane === viewerTeam;
    const playerDrewLane = lr.resTag === 'draw';
    const nameLink = (
      <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="ms-name">
        {playerData.riotIdGameName}
      </SummonerName>
    );
    const oppLink = (
      <SummonerName participant={opp} version={dataDragonVersion} platformId={gameData.info.platformId} className="ms-name">
        {opp.riotIdGameName}
      </SummonerName>
    );
    const lanePhraseLink = (text) => (
      <LaneMatchupTooltip
        role={playerRole}
        label={text}
        lanes={lanes}
        gameData={gameData}
        champsJSON={champsJSON}
        dataDragonVersion={dataDragonVersion}
        viewerTeam={viewerTeam}
        onClick={() => scrollTo(LANE_ANCHOR[playerRole])}
        // the lane chip below covers this role in the hover store; without this
        // opt-out, hovering either one would open both tooltips
        hoverSync={false}
      />
    );
    // a 2k+ gold gap at 15 (the lane cards' "dominates"/"obliterates" tiers)
    // upgrades the phrasing from plain won/lost to a stomp
    const stomped = lr.resTag === 'dominates' || lr.resTag === 'obliterates';
    const laneGold = fmtGold(lr.goldDifference);
    // "leading the way" is only earned when this was the team's biggest lane
    // win — a +900 top lane doesn't lead the way past a +2k bot lane
    const biggestWin = ROLES.every((r) => {
      const o = lanes[r];
      return o.resTag === 'draw' || o.teamWonLane !== viewerTeam || o.goldDifference <= lr.goldDifference;
    });
    if (playerDrewLane) {
      // after an "even" opener, "X and Y stayed even" would just repeat the
      // opening clause — fold the player in as one more example instead
      weave = evenLanes
        ? <>, {nameLink}{'’'}s matchup with {oppLink} ({oppChamp}) {lanePhraseLink(`in ${laneNoun}`)} included</>
        : <>, while {nameLink} and {oppLink} ({oppChamp}) {lanePhraseLink(`stayed even in ${laneNoun}`)}</>;
    } else if (playerWonLane && wonL > lostL && biggestWin) {
      weave = stomped
        ? <> — {nameLink} leading the way, {lanePhraseLink(`running away with ${laneNoun}`)} against {oppLink} ({oppChamp}), up {laneGold} gold by 15</>
        : <> — {nameLink} leading the way, {lanePhraseLink(`taking ${laneNoun}`)} from {oppLink} ({oppChamp})</>;
    } else if (playerWonLane && wonL > lostL) {
      // won their lane, but another lane won bigger — credit without the crown
      weave = stomped
        ? <>, with {nameLink} {lanePhraseLink(`running away with ${laneNoun}`)} against {oppLink} ({oppChamp}), up {laneGold} gold by 15</>
        : <>, with {nameLink} {lanePhraseLink(`taking ${laneNoun}`)} from {oppLink} ({oppChamp})</>;
    } else if (playerWonLane) {
      weave = stomped
        ? <>, though {nameLink} {lanePhraseLink(`ran away with ${laneNoun}`)} against {oppLink} ({oppChamp}), up {laneGold} gold by 15</>
        : <>, though {nameLink} {lanePhraseLink(`got the better of ${laneNoun}`)} against {oppLink} ({oppChamp})</>;
    } else if (lostL > wonL) {
      weave = stomped
        ? <> — {nameLink} included, {lanePhraseLink(`falling ${laneGold} gold behind`)} {oppLink} ({oppChamp}) in {laneNoun}</>
        : <> — {nameLink} included, {lanePhraseLink(`giving up ${laneNoun}`)} to {oppLink} ({oppChamp})</>;
    } else {
      weave = stomped
        ? <>, though {nameLink} {lanePhraseLink(`fell ${laneGold} gold behind`)} {oppLink} ({oppChamp}) in {laneNoun}</>
        : <>, though {nameLink} {lanePhraseLink(`came up short in ${laneNoun}`)} against {oppLink} ({oppChamp})</>;
    }
  }

  // ---- second sentence: gold arc + finish. The team is restated as the
  // subject so the arc can't read as being about the player named in the
  // lane sentence (the old single-sentence chain lost its subject there) ----
  const wonAt = surrendered ? `forced the surrender at ${endClock}` : `closed it out at ${endClock}`;
  const lostAt = surrendered ? `surrendered at ${endClock}` : null; // null -> the opponent finished it
  let arcSentence;
  if (comeback) {
    arcSentence = `Down ${fmtGold(maxDeficit)} gold at ${minutes[maxDeficitIdx]}:00, ${teamName} dug all the way back and ${wonAt}.`;
  } else if (slip) {
    arcSentence = `${teamName} led by ${fmtGold(maxLead)} gold at ${minutes[maxLeadIdx]}:00, but the game flipped and ${lostAt ? `they ${lostAt}` : `${oppTeamName} closed it out at ${endClock}`}.`;
  } else if (wire && win) {
    arcSentence = fromMin !== null
      ? `${teamName} pulled ahead by ${fromMin}:00, never let go, and ${wonAt}.`
      : `${teamName} led from the opening minutes and ${wonAt}.`;
  } else if (wire && !win) {
    const from = fromMin !== null ? `trailed from ${fromMin}:00 on` : 'trailed from the opening minutes on';
    const joiner = rallySize >= 2500 ? `, rallied briefly around ${minutes[rallyIdx]}:00, but ` : (lostAt ? ' and ' : ', and ');
    arcSentence = `${teamName} ${from}${joiner}${lostAt ?? `${oppTeamName} closed it out at ${endClock}`}.`;
  } else if (seesaw) {
    const closer = win ? `${teamName} ${wonAt}` : lostAt ? `${teamName} ${lostAt}` : `${oppTeamName} closed it out at ${endClock}`;
    arcSentence = `The lead changed hands ${leadChanges} times before ${closer}.`;
  } else if (closeGame) {
    const closer = win
      ? `${teamName} ${surrendered ? `forced the surrender at ${endClock}` : `edged it out at ${endClock}`}`
      : lostAt ? `${teamName} ${lostAt}` : `${oppTeamName} edged it out at ${endClock}`;
    arcSentence = `Neither side ever pulled away, but ${closer}.`;
  } else if (win) {
    arcSentence = `${teamName} edged ahead in the mid game, held on, and ${wonAt}.`;
  } else {
    arcSentence = lostAt
      ? `${teamName} fell behind in the mid game, never closed the gap, and ${lostAt}.`
      : `${teamName} fell behind in the mid game and never closed the gap — ${oppTeamName} finished it at ${endClock}.`;
  }

  // ---- 1v9 detection: a winner who cleared every carry bar gets a closing
  // sentence. Bars are strict on purpose — this should stay rare enough to
  // feel special (the Standouts card already handles ordinary MVPs) ----
  const winners = gameData.info.participants.filter((p) => p.win);
  const wTeamKills = winners.reduce((t, p) => t + p.kills, 0);
  const wTeamDamage = winners.reduce((t, p) => t + p.totalDamageDealtToChampions, 0);
  const carries = winners.filter((p) => {
    const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
    const kp = wTeamKills > 0 ? (p.kills + p.assists) / wTeamKills : 0;
    const dmgShare = wTeamDamage > 0 ? p.totalDamageDealtToChampions / wTeamDamage : 0;
    return kda >= 6 && kp >= 0.65 && dmgShare >= 0.3;
  });
  let carry = null;
  if (carries.length) {
    const star = carries.reduce((a, b) => (b.totalDamageDealtToChampions > a.totalDamageDealtToChampions ? b : a));
    const kp = Math.round(((star.kills + star.assists) / wTeamKills) * 100);
    const dmgShare = Math.round((star.totalDamageDealtToChampions / wTeamDamage) * 100);
    const starChamp = Object.values(champsJSON.data).find((c) => c.key === String(star.championId))?.name;
    const starTeam = star.teamId === 100 ? 'Blue' : 'Purple';
    const statLine = dmgShare >= 33
      ? `${star.kills}/${star.deaths}/${star.assists} and ${dmgShare}% of ${starTeam}’s damage`
      : `${star.kills}/${star.deaths}/${star.assists} with ${kp}% kill participation`;
    const starLink = (
      <SummonerName participant={star} version={dataDragonVersion} platformId={gameData.info.platformId} className="ms-name">
        {star.riotIdGameName}
      </SummonerName>
    );
    carry = star.puuid === playerData.puuid
      ? <>{' '}{starLink} put the team on their back — {statLine}.</>
      : star.teamId === viewerTeam
        ? <>{' '}{starLink} ({starChamp}) carried it — {statLine}.</>
        : <>{' '}{starLink} ({starChamp}) was the difference — {statLine}.</>;
  }

  const lede = (
    <>
      {laneOpen}
      {weave}
      {'. '}
      {arcSentence}
      {carry}
    </>
  );

  // ---- storyline chips ----
  const chips = [];
  ROLES.forEach((r) => {
    const lr = lanes[r];
    const draw = lr.resTag === 'draw';
    const laneWon = !draw && lr.teamWonLane === viewerTeam;
    const tone = draw ? '' : laneWon ? ' ms-good' : ' ms-bad';
    const sign = draw ? '±' : laneWon ? '+' : '−';
    chips.push(
      <LaneMatchupTooltip
        key={r}
        role={r}
        label={(
          <span className={'ms-chip ms-click' + tone}>
            {LANE_SHORT[r]} {sign}{fmtGold(lr.goldDifference)}
          </span>
        )}
        lanes={lanes}
        gameData={gameData}
        champsJSON={champsJSON}
        dataDragonVersion={dataDragonVersion}
        viewerTeam={viewerTeam}
        onClick={() => scrollTo(LANE_ANCHOR[r])}
      />
    );
  });
  chips.push(
    <span key="leads" className="ms-chip">
      {leadChanges === 0 ? 'Wire to wire' : `${leadChanges} lead change${leadChanges === 1 ? '' : 's'}`}
    </span>
  );
  chips.push(
    <span key="end" className={'ms-chip ' + (win ? 'ms-good' : 'ms-bad')}>
      {surrendered
        ? (win ? `Enemy surrender @ ${endClock}` : `Surrender @ ${endClock}`)
        : (win ? `Victory @ ${endClock}` : `Defeat @ ${endClock}`)}
    </span>
  );

  // ---- key moments: first blood, first tower, biggest swing, peak leads ----
  // Rendered as compact icon tiles: { at, icon, side, title, sub }.
  const msClock = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const teamSpan = (name) => (
    <span className={name === 'Blue' ? 'ms-t-blue' : 'ms-t-purple'}>{name}</span>
  );
  const moments = [];

  const frames = timelineData?.info?.frames || [];
  let firstBlood = null;
  let firstTower = null;
  for (const frame of frames) {
    for (const ev of frame.events || []) {
      if (!firstBlood && ev.type === 'CHAMPION_SPECIAL_KILL' && ev.killType === 'KILL_FIRST_BLOOD') firstBlood = ev;
      if (!firstTower && ev.type === 'BUILDING_KILL' && ev.buildingType === 'TOWER_BUILDING') firstTower = ev;
    }
    if (firstBlood && firstTower) break;
  }
  if (firstBlood) {
    const killer = gameData.info.participants.find((p) => p.participantId === firstBlood.killerId);
    if (killer) {
      moments.push({
        at: firstBlood.timestamp,
        icon: 'blood',
        side: killer.teamId === 100 ? 'blue' : 'purple',
        title: 'First Blood',
        sub: (
          <><SummonerName participant={killer} version={dataDragonVersion} platformId={gameData.info.platformId} className="ms-name">{killer.riotIdGameName}</SummonerName> · {msClock(firstBlood.timestamp)}</>
        ),
      });
    }
  }
  if (firstTower) {
    // BUILDING_KILL's teamId is the team that LOST the building
    const destroyer = firstTower.teamId === 100 ? 'Purple' : 'Blue';
    moments.push({
      at: firstTower.timestamp,
      icon: 'tower',
      side: destroyer.toLowerCase(),
      title: 'First Tower',
      sub: <>{teamSpan(destroyer)} · {msClock(firstTower.timestamp)}</>,
    });
  }
  // biggest minute-over-minute gold swing
  let swing = 0, swingIdx = 1;
  for (let i = 1; i < n; i++) {
    const d = series[i] - series[i - 1];
    if (Math.abs(d) > Math.abs(swing)) { swing = d; swingIdx = i; }
  }
  if (n > 1 && Math.abs(swing) >= 1000) {
    const gainer = swing > 0 ? teamName : oppTeamName;
    moments.push({
      at: minutes[swingIdx] * 60000,
      icon: 'swing',
      side: gainer.toLowerCase(),
      title: 'Biggest Swing',
      sub: <>{teamSpan(gainer)} +{fmtGold(swing)} in 1 min · {minutes[swingIdx]}:00</>,
    });
  }
  // Peak lead per side (deficit reframed as the opponent's peak lead). The
  // dominant side's peak shows at >=1k; the other side's only when it was a
  // genuine lead (>=2.5k — comeback/throw territory), not an early blip.
  const viewerDominant = maxLead >= -maxDeficit;
  const viewerBar = viewerDominant ? 1000 : 2500;
  const oppBar = viewerDominant ? 2500 : 1000;
  if (maxLead >= viewerBar) {
    moments.push({
      at: minutes[maxLeadIdx] * 60000,
      icon: 'peak',
      side: teamName.toLowerCase(),
      title: 'Peak Lead',
      sub: <>{teamSpan(teamName)} +{fmtGold(maxLead)} · {minutes[maxLeadIdx]}:00</>,
    });
  }
  if (-maxDeficit >= oppBar) {
    moments.push({
      at: minutes[maxDeficitIdx] * 60000,
      icon: 'peak',
      side: oppTeamName.toLowerCase(),
      title: 'Peak Lead',
      sub: <>{teamSpan(oppTeamName)} +{fmtGold(maxDeficit)} · {minutes[maxDeficitIdx]}:00</>,
    });
  }
  moments.sort((a, b) => a.at - b.at);

  return { headline, lede, chips, moments };
};

export default generateMatchStory;
