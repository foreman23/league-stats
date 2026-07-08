/* ============================================================
   Post-game Scoreboard — components.
   Reuses Portrait from components.jsx.
   Spells / runes / items / trinkets are PLACEHOLDER glyphs
   (deterministic color) — swap for real Data Dragon art.
   ============================================================ */
const { useState: useStateSB, useEffect: useEffectSB } = React;

function useGrownSB() {
  const [g, setG] = useStateSB(false);
  useEffectSB(() => { const t = setTimeout(() => setG(true), 60); return () => clearTimeout(t); }, []);
  return g;
}

function seedHue(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

/* known-ish tints so placeholders read plausibly */
const SPELL_TINT = {
  Flash: ["#C9A93B", "#8C7A2A"], Ignite: ["#E0734A", "#A8402099"], Smite: ["#C45A3A", "#7E3320"],
  Teleport: ["#4C7FD0", "#274B86"], Heal: ["#D9B94A", "#8FA45E"], Exhaust: ["#C7A24E", "#7E6B2E"],
  Ghost: ["#7E84C0", "#454A7E"],
};
function Spell({ name }) {
  const t = SPELL_TINT[name] || ["#5B6270", "#363B46"];
  return <span className="sb-spell" title={name}
    style={{ background: `linear-gradient(145deg, ${t[0]}, ${t[1]})` }} />;
}

const TREE_COLOR = {
  Conqueror: "#C8AA6E", Electrocute: "#D14B5A", "First Strike": "#E0B24A", "Hail of Blades": "#D14B5A",
  Aftershock: "#4FA56B", Guardian: "#4FA56B", Precision: "#C8AA6E", Domination: "#D14B5A",
  Sorcery: "#6E8BD1", Resolve: "#4FA56B", Inspiration: "#49B3B0",
};
function Rune({ name, secondary }) {
  const c = TREE_COLOR[name] || "#8A90A0";
  return (
    <span className={"sb-rune " + (secondary ? "sec" : "key")} title={name}>
      <span className="rd" style={{ background: c, width: secondary ? 7 : 9, height: secondary ? 7 : 9 }} />
    </span>
  );
}

function Item({ seed }) {
  if (!seed) return <span className="sb-item empty" />;
  const h = seedHue(seed);
  return <span className="sb-item"
    style={{ background: `linear-gradient(150deg, hsl(${h} 46% 52%), hsl(${(h + 28) % 360} 50% 32%))` }} />;
}

const TRINKET_TINT = { Yellow: ["#D9B94A", "#8F7424"], Red: ["#D1594A", "#892F22"], Blue: ["#4C8FD0", "#274B86"] };
function Trinket({ kind }) {
  const t = TRINKET_TINT[kind] || ["#5B6270", "#363B46"];
  return <span className="sb-trinket" title={kind + " trinket"}
    style={{ background: `radial-gradient(circle at 42% 36%, ${t[0]}, ${t[1]})` }} />;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function PlayerRowSB({ p, side, maxDamage }) {
  const grown = useGrownSB();
  const href = `https://riftreport.gg/summoner/${encodeURIComponent(p.name)}-${p.tag}`;
  const dmgPct = grown ? Math.max(4, (p.damage / maxDamage) * 100) : 0;
  const placeCls = p.placement === 1 ? "p1" : p.placement === 2 ? "p2" : p.placement === 3 ? "p3" : "";
  const scoreCls = p.score >= 6.5 ? "hi" : p.score < 5 ? "lo" : "";
  const ratioGood = p.kda >= 4;
  return (
    <div className="sb-row">
      {/* identity */}
      <div className="sb-ident">
        <span className="sb-port">
          <Portrait player={{ champ: p.champ, side, winner: false }} />
          <span className="sb-level">{p.level}</span>
        </span>
        <span className="sb-mini">
          <Spell name={p.spells[0]} />
          <Spell name={p.spells[1]} />
        </span>
        <span className="sb-mini">
          <Rune name={p.runes[0]} />
          <Rune name={p.runes[1]} secondary />
        </span>
        <span className="sb-nameblock">
          <a className="sb-name" href={href} onClick={(e) => e.preventDefault()}>{p.name}</a>
          <span className="sb-sub">
            <span className={"sb-place " + placeCls}>{ordinal(p.placement)}</span>
            <span className={"sb-score " + scoreCls}>{p.score.toFixed(1)}</span>
          </span>
        </span>
      </div>

      {/* role */}
      <div className="sb-cell sb-role">{p.role}</div>

      {/* kda */}
      <div className="sb-cell sb-kda">
        <div className="line">{p.k}<span className="sl">/</span>{p.d}<span className="sl">/</span>{p.a}</div>
        <div className={"ratio" + (ratioGood ? " good" : "")}>{p.kda.toFixed(1)} KDA</div>
      </div>

      {/* damage */}
      <div className="sb-cell sb-dmg">
        <span className="v">{p.damage.toLocaleString()}</span>
        <div className="bar"><div className="fill" style={{ width: dmgPct + "%" }} /></div>
      </div>

      {/* gold */}
      <div className="sb-cell sb-gold">{p.gold.toLocaleString()}g</div>

      {/* cs */}
      <div className="sb-cell sb-cs">
        <span className="v">{p.cs}</span> <span className="m">{p.csm}/m</span>
      </div>

      {/* wards */}
      <div className="sb-cell sb-wards">{p.wards}</div>

      {/* build */}
      <div className="sb-cell sb-build">
        {p.items.map((it, i) => <Item key={i} seed={it} />)}
        <Trinket kind={p.trinket} />
      </div>
    </div>
  );
}

function TeamTable({ team, side, maxDamage }) {
  const win = team.result === "Victory";
  const teamName = side === "blue" ? "Blue Team" : "Purple Team";
  return (
    <div className={"sb-table " + side}>
      <div className="sb-scroll">
        <div className="sb-inner">
          <div className="sb-header">
            <div className="sb-team">
              <span className="tn">{teamName}</span>
              <span className={"sb-result " + (win ? "win" : "loss")}>
                {win ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                ) : null}
                {team.result}
              </span>
            </div>
            <div className="sb-colh">Role</div>
            <div className="sb-colh">KDA</div>
            <div className="sb-colh">Damage</div>
            <div className="sb-colh">Gold</div>
            <div className="sb-colh">CS</div>
            <div className="sb-colh c">Wards</div>
            <div className="sb-colh">Build</div>
          </div>
          {team.players.map((p, i) => (
            <PlayerRowSB key={i} p={p} side={side} maxDamage={maxDamage} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Scoreboard({ data }) {
  return (
    <div className="sb-wrap">
      <div className="sb-head">
        <h2>Match Scoreboard</h2>
        <p className="sub">Per-player results at the end of the game</p>
      </div>
      <TeamTable team={data.blue} side="blue" maxDamage={data.maxDamage} />
      <TeamTable team={data.purple} side="purple" maxDamage={data.maxDamage} />
    </div>
  );
}

Object.assign(window, { Scoreboard, TeamTable, PlayerRowSB });
