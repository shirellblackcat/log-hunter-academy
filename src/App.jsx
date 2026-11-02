import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import MissionSelector from "./components/MissionSelector";
import MissionWorkspace from "./components/MissionWorkspace";
import { missions } from "./data/missions";
import { useProgress } from "./game/useProgress";
import { totalXp } from "./game/scoring";

export default function App() {
  const [missionId, setMissionId] = useState("auth");
  const { results, theme, recordResult, toggleTheme } = useProgress();
  const mission = missions.find((m) => m.id === missionId);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <NavBar xp={totalXp(results)} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <section className="hero">
          <h1>Hunt the threat.</h1>
          <p>Read the logs, flag the evidence, make the call.</p>
        </section>
        <h2 className="sr-only">Missions</h2>
        <MissionSelector missions={missions} activeId={missionId} results={results} onSelect={setMissionId} />
        <MissionWorkspace key={mission.id} mission={mission} onComplete={recordResult} />
      </main>
      <footer>
        <img className="signature" src={`${import.meta.env.BASE_URL}shirell-wordmark.png`} alt="Shirell" />
        <span>Built by SHIRELL | Tech Meets Purpose.</span>
      </footer>
    </div>
  );
}
