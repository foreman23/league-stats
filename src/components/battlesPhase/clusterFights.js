// Spatio-temporal fight clustering for the Battles section.
//
// The old approach chained kill events purely by time (each within 20s of the
// previous one), which glued simultaneous fights on opposite sides of the map
// into one "battle" and let late-game action snowball into map-wide blobs.
//
// Here several fights can be open at once. An event joins an open fight only
// if it happened within TIME_GAP of that fight's latest event AND either
//   - it's within NEAR map units of one of the fight's RECENT latest events
//     (chain locality: a moving chase stays one fight, while two static
//     fights on opposite sides of the map stay separate), or
//   - it shares a participant (killer/victim/assist) with the fight so far
//     (rescues TP flanks and long-range picks that belong to the fight).
// Otherwise it opens a new fight. Fights close after TIME_GAP of silence.
// When several open fights qualify, the physically nearest one wins.
//
// Returns a flat, fight-ordered list of shallow-copied events, each tagged
// with __fight (its fight's index). Battles.js flushes a battle whenever the
// __fight id changes, so its per-battle derivation code is untouched.

const KILL_TYPES = ['CHAMPION_KILL', 'ELITE_MONSTER_KILL', 'BUILDING_KILL', 'CHAMPION_SPECIAL_KILL'];
const TIME_GAP = 20000; // ms of silence before a fight closes (the old chain window)
const NEAR = 3500;      // map units (the map is ~14870 square): "same fight" radius
const RECENT = 3;       // how many of a fight's latest events the proximity test uses

const participantsOf = (ev) => [
    ev.killerId,
    ev.victimId,
    ...(ev.assistingParticipantIds || []),
].filter((id) => id > 0);

const distance = (a, b) =>
    a?.position && b?.position
        ? Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y)
        : Infinity;

export default function clusterFightEvents(frames) {
    const events = [];
    (frames || []).forEach((frame) => {
        (frame.events || []).forEach((ev) => {
            if (KILL_TYPES.includes(ev.type)) events.push(ev);
        });
    });
    events.sort((a, b) => a.timestamp - b.timestamp);

    const open = [];   // { events: [...], participants: Set }
    const closed = [];
    events.forEach((ev) => {
        // retire fights that have gone quiet
        for (let i = open.length - 1; i >= 0; i--) {
            const last = open[i].events[open[i].events.length - 1];
            if (ev.timestamp - last.timestamp > TIME_GAP) {
                closed.push(open[i]);
                open.splice(i, 1);
            }
        }

        const ids = participantsOf(ev);
        let best = null;
        open.forEach((fight) => {
            const recent = fight.events.slice(-RECENT);
            const d = Math.min(...recent.map((r) => distance(ev, r)));
            const shared = ids.some((id) => fight.participants.has(id));
            if (d > NEAR && !shared) return; // not part of this fight
            if (!best || d < best.d) best = { fight, d };
        });

        if (best) {
            best.fight.events.push(ev);
            ids.forEach((id) => best.fight.participants.add(id));
        } else {
            open.push({ events: [ev], participants: new Set(ids) });
        }
    });
    closed.push(...open);
    closed.sort((a, b) => a.events[0].timestamp - b.events[0].timestamp);

    return closed.flatMap((fight, i) => fight.events.map((ev) => ({ ...ev, __fight: i })));
}
