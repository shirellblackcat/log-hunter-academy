import { CheckCircle2 } from "lucide-react";

export default function MissionSelector({ missions, activeId, results, onSelect }) {
  return (
    <div className="mission-grid" role="list">
      {missions.map((m) => {
        const r = results[m.id];
        return (
          <button key={m.id} role="listitem" className={`card mission ${m.id === activeId ? "active" : ""}`} aria-pressed={m.id === activeId} onClick={() => onSelect(m.id)}>
            <span className="label">{m.level}</span>
            <h3>{m.title}</h3>
            <p>{m.summary}</p>
            {r ? (
              <span className="badge success"><CheckCircle2 size={14} /> Rank {r.bestRating} · {r.bestScore} XP</span>
            ) : (
              <span className="badge pink">Up to 100 XP</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
