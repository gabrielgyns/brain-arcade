import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import type { PlayResult } from "../../domain/shared/types";
import { formatDuration } from "../../domain/shared/day";
import type { GameProps, PlayMode } from "../../app/session";
import { useApp } from "../../app/store";
import { messages } from "../../i18n/messages";
import { track } from "../../infra/analytics";
import { ResultPanel } from "./ResultPanel";
import { AdSlot } from "./AdSlot";
import { dailyResult, specKey } from "../../domain/progress/progress";

/**
 * Frames any game: header, context banner (daily/challenge), and the
 * end-of-game flow. Games themselves stay focused on their own rules.
 */
export function GameShell({
  game: Game,
  props,
  onPlayAgain,
  toolbar,
}: {
  game: ComponentType<GameProps>;
  props: Omit<GameProps, "onFinish">;
  onPlayAgain?(): void;
  toolbar?: React.ReactNode;
}) {
  const { spec, mode } = props;
  const { addResult, progress } = useApp();
  // Captured once: a daily finished in an earlier visit shows its result instead of the board.
  const [alreadyDone] = useState(() => (mode.kind === "daily" ? dailyResult(progress, mode.day, spec.game) : undefined));
  const [result, setResult] = useState<PlayResult | null>(alreadyDone ?? null);
  const info = messages.games[spec.game];
  const started = useRef<string | null>(null);

  useEffect(() => {
    const key = specKey(spec);
    if (started.current === key || alreadyDone) return;
    started.current = key;
    setResult(null);
    track({ name: "game_start", game: spec.game, daily: mode.kind === "daily", challenge: mode.kind === "challenge" });
  }, [spec, mode.kind, alreadyDone]);

  const onFinish = useCallback<GameProps["onFinish"]>(
    (outcome) => {
      const r: PlayResult = {
        spec,
        day: mode.kind === "daily" ? mode.day : undefined,
        ...outcome,
        finishedAt: new Date().toISOString(),
      };
      addResult(r);
      setResult(r);
      track({ name: "game_complete", game: spec.game, daily: mode.kind === "daily", challenge: mode.kind === "challenge", timeMs: r.timeMs });
    },
    [spec, mode, addResult],
  );

  return (
    <div className="game-shell">
      <div className="game-header">
        <div>
          <h1>{info.name}</h1>
          <p className="muted">
            {messages.difficulty[spec.difficulty]}
            {mode.kind === "daily" && " · Desafio do dia"}
          </p>
        </div>
        {toolbar}
      </div>
      <ModeBanner mode={mode} />
      {alreadyDone ? (
        <>
          <p className="notice">
            {alreadyDone.solved ? `Já resolveu este desafio em ${formatDuration(alreadyDone.timeMs)}.` : "Já jogou este desafio hoje."} Volte amanhã para um novo!
          </p>
          <ResultPanel result={alreadyDone} mode={mode} onPlayAgain={onPlayAgain} />
        </>
      ) : (
        <>
          <Game key={specKey(spec)} {...props} onFinish={onFinish} />
          {result && (
            <>
              <ResultPanel result={result} mode={mode} onPlayAgain={onPlayAgain} />
              <AdSlot placement="between-games" />
            </>
          )}
        </>
      )}
      <details className="how-to">
        <summary>Como jogar</summary>
        <ul>{info.howTo.map((line) => <li key={line}>{line}</li>)}</ul>
        <Link to="/revista">Ler artigos sobre estratégia →</Link>
      </details>
    </div>
  );
}

function ModeBanner({ mode }: { mode: PlayMode }) {
  if (mode.kind !== "challenge") return null;
  const { challenge } = mode;
  return (
    <p className="challenge-banner">
      🎯 <strong>{challenge.name ?? "Um amigo"}</strong> resolveu este puzzle em <strong>{formatDuration(challenge.timeMs)}</strong>
      {challenge.mistakes ? ` com ${challenge.mistakes} erro(s)` : ""}. Consegue fazer melhor?
    </p>
  );
}
