export const HINT_COST = 5;
export const FALSE_FLAG_COST = 5;
export const XP_PER_LEVEL = 100;

// 50 pts for the verdict, up to 50 for evidence, minus penalties.
export function scoreMission(mission, verdict, flaggedIds, hintsUsed) {
  const evidenceIds = mission.logs.filter((l) => l.evidence).map((l) => l.id);
  const flagged = new Set(flaggedIds);
  const hits = evidenceIds.filter((id) => flagged.has(id)).length;
  const missed = evidenceIds.filter((id) => !flagged.has(id));
  const falseFlags = [...flagged].filter((id) => !evidenceIds.includes(id));
  const verdictCorrect = verdict === mission.correctVerdict;

  const verdictPoints = verdictCorrect ? 50 : 0;
  const evidencePoints = evidenceIds.length ? Math.round((50 * hits) / evidenceIds.length) : 0;
  const penalty = falseFlags.length * FALSE_FLAG_COST + hintsUsed * HINT_COST;
  const total = Math.max(0, verdictPoints + evidencePoints - penalty);

  return { verdictCorrect, verdictPoints, evidencePoints, hits, missed, falseFlags, penalty, total, rating: rate(total) };
}

export function rate(total) {
  if (total >= 90) return "S";
  if (total >= 75) return "A";
  if (total >= 55) return "B";
  return "C";
}

export const levelFromXp = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp) => xp % XP_PER_LEVEL;

// Only each mission's best score counts, so replays can't be farmed.
export const totalXp = (results) => Object.values(results).reduce((sum, r) => sum + r.bestScore, 0);
