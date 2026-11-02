import { useMemo, useState } from "react";
import { Flag, Lightbulb, Search, RotateCcw } from "lucide-react";
import { VERDICTS } from "../data/missions";
import { HINT_COST, FALSE_FLAG_COST, scoreMission } from "../game/scoring";

export default function MissionWorkspace({ mission, onComplete }) {
  const [flagged, setFlagged] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? mission.logs.filter((l) => `${l.source} ${l.event} ${l.message}`.toLowerCase().includes(q)) : mission.logs;
  }, [mission, query]);

  const done = result !== null;
  const toggle = (id) => !done && setFlagged((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const submit = () => {
    const r = scoreMission(mission, verdict, flagged, hintsUsed);
    setResult(r);
    onComplete(mission.id, r);
  };

  const retry = () => {
    setFlagged([]);
    setVerdict(null);
    setHintsUsed(0);
    setQuery("");
    setResult(null);
  };

  const status = (log) => {
    if (!done) return "";
    if (log.evidence) return flagged.includes(log.id) ? "hit" : "miss";
    return flagged.includes(log.id) ? "false" : "";
  };

  return (
    <section className="workspace card" aria-labelledby="mission-title">
      <span className="label">{mission.level}</span>
      <h2 id="mission-title">{mission.title}</h2>
      <p>{mission.objective}</p>

      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Filter logs" aria-label="Filter logs" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <span className="label">{flagged.length} flagged</span>
      </div>

      <div className="logs" role="list">
        {visible.map((log) => (
          <div key={log.id} role="listitem" className={`log ${flagged.includes(log.id) ? "flagged" : ""} ${status(log)}`}>
            <code>
              <span className="log-meta">{log.time} · {log.source} · {log.event}</span>
              <br />
              {log.message}
            </code>
            <button className="btn ghost icon" disabled={done} aria-pressed={flagged.includes(log.id)} aria-label={`${flagged.includes(log.id) ? "Unflag" : "Flag"} log ${log.id} as evidence`} onClick={() => toggle(log.id)}>
              <Flag size={20} />
            </button>
            {done && log.evidence && log.why && <p className="why">{log.why}</p>}
          </div>
        ))}
        {visible.length === 0 && <p>No logs match that filter.</p>}
      </div>

      {!done && (
        <>
          <div className="hints">
            {mission.hints.slice(0, hintsUsed).map((h, i) => (
              <p key={i} className="tooltip"><Lightbulb size={16} aria-hidden="true" /> {h}</p>
            ))}
            <button className="btn secondary" disabled={hintsUsed >= mission.hints.length} onClick={() => setHintsUsed((n) => n + 1)}>
              Need a hint? (-{HINT_COST} XP)
            </button>
          </div>

          <div className="card verdict">
            <span className="label">Your call</span>
            <h3>What's the verdict?</h3>
            <p>Think carefully. You've got this. Wrong flags cost {FALSE_FLAG_COST} XP each.</p>
            <div className="options" role="radiogroup" aria-label="Verdict">
              {VERDICTS.map((v) => (
                <button key={v.id} role="radio" aria-checked={verdict === v.id} className={`option ${verdict === v.id ? "selected" : ""}`} onClick={() => setVerdict(v.id)}>
                  <strong>{v.label}</strong>
                  <small>{v.hint}</small>
                </button>
              ))}
            </div>
            <button className="btn primary block" disabled={!verdict} onClick={submit}>Submit verdict</button>
          </div>
        </>
      )}

      {done && (
        <div className={`card result ${result.verdictCorrect ? "win" : "lose shake"}`} role="status">
          <img className="neko" src={`${import.meta.env.BASE_URL}cyber-neko.png`} width="56" height="56" alt="" />
          <h3>{result.verdictCorrect ? "Level up! Rank " + result.rating : "Not quite, but that's a great attempt. Let's review."}</h3>
          <p className="score">{result.total} / 100 XP</p>
          <ul>
            <li>Verdict: {result.verdictPoints} / 50</li>
            <li>Evidence: {result.hits} of {result.hits + result.missed.length} found (+{result.evidencePoints})</li>
            <li>Penalties: -{result.penalty} ({result.falseFlags.length} wrong flags, {hintsUsed} hints)</li>
          </ul>
          <h4>Debrief</h4>
          <p>{mission.explanation}</p>
          <button className="btn secondary" onClick={retry}><RotateCcw size={16} /> Retry</button>
        </div>
      )}
    </section>
  );
}
