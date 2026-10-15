import { Link, Navigate, useParams } from "react-router-dom";
import { dailyChallenge } from "../../domain/daily/daily";
import { formatDuration, parseDayKey, toDayKey } from "../../domain/shared/day";
import { computeStreak, dailyResult } from "../../domain/progress/progress";
import { gameBySlug, messages } from "../../i18n/messages";
import { GAME_COMPONENTS, GAME_ICONS } from "../games/registry";
import { GameShell } from "../components/GameShell";
import { useApp } from "../../app/store";
import { useDocumentTitle } from "../useDocumentTitle";

export function DailyHubPage() {
  useDocumentTitle("Desafio do dia", "Sudoku, caça-palavras, nonograma e enigma do dia — iguais para todos os jogadores.");
  const { progress, settings } = useApp();
  const today = toDayKey(new Date());
  const challenge = dailyChallenge(today, settings.locale);
  const streak = computeStreak(progress, today);
  const dateLabel = parseDayKey(today).toLocaleDateString("pt", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <h1>Desafio do dia</h1>
      <p className="muted">
        {dateLabel} · {messages.difficulty[challenge.specs[0]!.difficulty]} · os mesmos puzzles para todos os jogadores.
      </p>
      <div className="streak-row">
        <span className="streak-pill">🔥 Sequência atual: {streak.current}</span>
        <span className="streak-pill subtle">🏅 Melhor: {streak.best}</span>
      </div>
      <div className="daily-list">
        {challenge.specs.map((spec) => {
          const done = dailyResult(progress, today, spec.game);
          return (
            <Link key={spec.game} to={`/diario/${messages.games[spec.game].slug}`} className={`daily-item ${done?.solved ? "done" : done ? "seen" : ""}`}>
              <span className="game-icon" aria-hidden>{GAME_ICONS[spec.game]}</span>
              <span>
                <strong>{messages.games[spec.game].name} do dia</strong>
                <span className="muted">{done ? (done.solved ? `Resolvido em ${formatDuration(done.timeMs)}` : "Resposta vista — amanhã há mais") : messages.games[spec.game].tagline}</span>
              </span>
              <span className="daily-state">{done ? (done.solved ? "✓" : "–") : "Jogar →"}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function DailyPlayPage() {
  const { slug = "" } = useParams();
  const game = gameBySlug(slug);
  const { settings } = useApp();
  const today = toDayKey(new Date());
  useDocumentTitle(game && `${messages.games[game].name} do dia`);
  const spec = game && dailyChallenge(today, settings.locale).specs.find((s) => s.game === game);
  if (!spec) return <Navigate to="/diario" replace />;

  return (
    <>
      <Link to="/diario" className="back-link">← Desafio do dia</Link>
      <GameShell key={`${today}:${spec.game}`} game={GAME_COMPONENTS[spec.game]} props={{ spec, mode: { kind: "daily", day: today } }} />
    </>
  );
}
