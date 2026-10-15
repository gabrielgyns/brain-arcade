import { GAME_IDS, DIFFICULTIES } from "../../domain/shared/types";
import { formatDuration, toDayKey } from "../../domain/shared/day";
import { activeDaysThisWeek, computeStreak, gameStats } from "../../domain/progress/progress";
import { messages } from "../../i18n/messages";
import { GAME_ICONS } from "../games/registry";
import { useApp } from "../../app/store";
import { useDocumentTitle } from "../useDocumentTitle";

export function StatsPage() {
  useDocumentTitle("Estatísticas");
  const { progress, settings, updateSettings } = useApp();
  const today = toDayKey(new Date());
  const streak = computeStreak(progress, today);
  const recent = [...progress.results].reverse().slice(0, 10);

  return (
    <>
      <h1>As suas estatísticas</h1>
      <p className="muted">Guardadas apenas neste dispositivo. Não é preciso conta.</p>
      <dl className="kpis">
        <div><dt>Sequência atual</dt><dd>🔥 {streak.current}</dd></div>
        <div><dt>Melhor sequência</dt><dd>🏅 {streak.best}</dd></div>
        <div><dt>Dias ativos (7 dias)</dt><dd>{activeDaysThisWeek(progress, today)}</dd></div>
        <div><dt>Puzzles resolvidos</dt><dd>{progress.results.filter((r) => r.solved).length}</dd></div>
      </dl>

      <h2>Por jogo</h2>
      <div className="table-wrap">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Resolvidos</th>
              <th>Tempo médio</th>
              {DIFFICULTIES.map((d) => <th key={d}>Recorde {messages.difficulty[d].toLowerCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {GAME_IDS.map((g) => {
              const s = gameStats(progress, g);
              return (
                <tr key={g}>
                  <td>{GAME_ICONS[g]} {messages.games[g].name}</td>
                  <td>{s.solved}/{s.played}</td>
                  <td>{s.averageTimeMs === null ? "—" : formatDuration(s.averageTimeMs)}</td>
                  {DIFFICULTIES.map((d) => (
                    <td key={d}>{s.bestTimeMs[d] === undefined ? "—" : formatDuration(s.bestTimeMs[d]!)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {recent.length > 0 && (
        <>
          <h2>Histórico recente</h2>
          <ul className="history">
            {recent.map((r) => (
              <li key={r.finishedAt}>
                {GAME_ICONS[r.spec.game]} {messages.games[r.spec.game].name} · {messages.difficulty[r.spec.difficulty]}
                {r.day && " · diário"} — {r.solved ? formatDuration(r.timeMs) : "não resolvido"}
                <span className="muted"> · {new Date(r.finishedAt).toLocaleDateString("pt")}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Preferências</h2>
      <div className="prefs">
        <label><input type="checkbox" checked={settings.showTimer} onChange={(e) => updateSettings({ showTimer: e.target.checked })} /> Mostrar cronómetro</label>
        <label><input type="checkbox" checked={settings.highlightErrors} onChange={(e) => updateSettings({ highlightErrors: e.target.checked })} /> Assinalar erros</label>
      </div>
    </>
  );
}
