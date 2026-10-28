import { Link } from "react-router-dom";
import { GAME_IDS } from "../../domain/shared/types";
import { toDayKey } from "../../domain/shared/day";
import { computeStreak, dailyResult } from "../../domain/progress/progress";
import { DAILY_GAMES } from "../../domain/daily/daily";
import { messages } from "../../i18n/messages";
import { GAME_ICONS } from "../games/registry";
import { ARTICLES } from "../../content/articles";
import { useApp } from "../../app/store";
import { useDocumentTitle } from "../useDocumentTitle";

export function HomePage() {
  useDocumentTitle();
  const { progress } = useApp();
  const today = toDayKey(new Date());
  const doneToday = DAILY_GAMES.filter((g) => dailyResult(progress, today, g)).length;
  const streak = computeStreak(progress, today);

  return (
    <>
      <section className="hero">
        <div className="hero-tiles" aria-hidden>
          {["7", "A", "■", "?", "3", "Z"].map((t, i) => (
            <span key={i} className={`tile tile-${i}`}>{t}</span>
          ))}
        </div>
        <h1>
          Jogue cinco minutos. <span className="highlight">Volte amanhã.</span>
        </h1>
        <p>Sudoku, caça-palavras, nonogramas e enigmas — grátis, sem conta, no telemóvel ou no computador.</p>
        <div className="actions">
          <Link to="/diario" className="btn primary big">
            {doneToday === 0 ? "Começar o desafio do dia" : doneToday < DAILY_GAMES.length ? `Continuar desafio (${doneToday}/${DAILY_GAMES.length})` : "Desafio do dia concluído ✓"}
          </Link>
          {streak.current > 0 && <span className="streak-pill">🔥 {streak.current} {streak.current === 1 ? "dia" : "dias"} seguidos</span>}
        </div>
      </section>

      <section>
        <h2>Jogos</h2>
        <div className="card-grid">
          {GAME_IDS.map((g) => (
            <Link key={g} to={`/jogos/${messages.games[g].slug}`} className="game-card" data-game={g}>
              <span className="game-icon" aria-hidden>{GAME_ICONS[g]}</span>
              <strong>{messages.games[g].name}</strong>
              <span className="muted">{messages.games[g].tagline}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Da revista</h2>
        <div className="article-list">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link key={a.slug} to={`/revista/${a.slug}`} className="article-card">
              <span className="tag">{a.category}</span>
              <strong>{a.title}</strong>
              <span className="muted">{a.summary}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
