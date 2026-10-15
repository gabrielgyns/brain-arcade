import { useMemo } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { DIFFICULTIES, type Difficulty, type PuzzleSpec } from "../../domain/shared/types";
import { gameBySlug, messages } from "../../i18n/messages";
import { GameShell } from "../components/GameShell";
import { DifficultyPicker } from "../components/DifficultyPicker";
import { GAME_COMPONENTS, newSeed } from "../games/registry";
import { useApp } from "../../app/store";
import { useDocumentTitle } from "../useDocumentTitle";
import { readJson, writeJson } from "../../infra/storage";

/**
 * Free play. The puzzle lives in the URL (?d=medium&s=123) so a refresh keeps
 * the same board and any URL can be shared as-is.
 */
export function PlayPage() {
  const { slug = "" } = useParams();
  const game = gameBySlug(slug);
  const [params, setParams] = useSearchParams();
  const { settings } = useApp();
  useDocumentTitle(game && `${messages.games[game].name} grátis online`, game && messages.games[game].tagline);

  const lastDifficulty = game ? readJson<Difficulty>(`difficulty:${game}`, "easy") : "easy";
  const d = params.get("d") as Difficulty | null;
  const difficulty: Difficulty = d && DIFFICULTIES.includes(d) ? d : lastDifficulty;
  const seedParam = Number(params.get("s"));
  const hasSeed = params.has("s") && Number.isFinite(seedParam);

  const spec = useMemo<PuzzleSpec | null>(
    () => (game && hasSeed ? { game, difficulty, seed: seedParam >>> 0, locale: settings.locale } : null),
    [game, difficulty, seedParam, hasSeed, settings.locale],
  );

  if (!game) return <Navigate to="/jogos" replace />;
  if (!spec) {
    return <Navigate to={`/jogos/${slug}?d=${difficulty}&s=${newSeed(game, difficulty)}`} replace />;
  }

  const startNew = (next: Difficulty = difficulty) => {
    writeJson(`difficulty:${game}`, next);
    setParams({ d: next, s: String(newSeed(game, next)) });
  };

  return (
    <GameShell
      game={GAME_COMPONENTS[game]}
      props={{ spec, mode: { kind: "free" } }}
      onPlayAgain={() => startNew()}
      toolbar={
        <div className="toolbar">
          <DifficultyPicker value={difficulty} onChange={startNew} />
          <button className="btn" onClick={() => startNew()}>Novo jogo</button>
        </div>
      }
    />
  );
}
