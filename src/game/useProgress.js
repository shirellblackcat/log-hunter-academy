import { useCallback, useEffect, useState } from "react";

const KEY = "log-hunter-academy:v1";
const empty = { results: {}, theme: "dark" };

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return parsed && typeof parsed === "object" ? { ...empty, ...parsed } : empty;
  } catch {
    return empty;
  }
}

export function useProgress() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage blocked: progress just won't persist */
    }
  }, [state]);

  const recordResult = useCallback((missionId, result) => {
    setState((s) => {
      const prev = s.results[missionId];
      const isBest = !prev || result.total >= prev.bestScore;
      return {
        ...s,
        results: {
          ...s.results,
          [missionId]: {
            bestScore: isBest ? result.total : prev.bestScore,
            bestRating: isBest ? result.rating : prev.bestRating,
            attempts: (prev?.attempts ?? 0) + 1,
          },
        },
      };
    });
  }, []);

  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })), []);
  const resetProgress = useCallback(() => setState((s) => ({ ...s, results: {} })), []);

  return { ...state, recordResult, toggleTheme, resetProgress };
}
