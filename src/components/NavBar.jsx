import { Moon, Sun } from "lucide-react";
import { levelFromXp, xpIntoLevel, XP_PER_LEVEL } from "../game/scoring";

export default function NavBar({ xp, theme, onToggleTheme }) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}cyber-neko.png`} width="32" height="32" alt="Cyber-Neko" />
        <span className="brand-name">LOG HUNTER ACADEMY</span>
      </div>
      <div className="nav-right">
        <div className="xp-wrap" title={`${xpIntoLevel(xp)} / ${XP_PER_LEVEL} XP to next level`}>
          <span className="badge">LVL {levelFromXp(xp)}</span>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpIntoLevel(xp)} aria-label="Level progress">
            <div className="progress-fill" style={{ width: `${xpIntoLevel(xp)}%` }} />
          </div>
          <span className="badge">{xp} XP</span>
        </div>
        <button className="btn ghost icon" onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
