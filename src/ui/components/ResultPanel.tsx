import { useState } from "react";
import type { PlayResult } from "../../domain/shared/types";
import { formatDuration, parseDayKey } from "../../domain/shared/day";
import { compareToChallenge, encodeChallenge } from "../../domain/challenge/challenge";
import type { PlayMode } from "../../app/session";
import { messages } from "../../i18n/messages";
import { shareText, whatsappUrl } from "../../infra/share";
import { track } from "../../infra/analytics";
import { useApp } from "../../app/store";
import { Confetti } from "./Confetti";

const VERDICT_TEXT = {
  won: "Venceu o desafio! 🏆",
  lost: "Desta vez não deu — tente outro puzzle!",
  tie: "Empate perfeito! 🤝",
} as const;

export function ResultPanel({
  result,
  mode,
  onPlayAgain,
  celebrate = true,
}: {
  result: PlayResult;
  mode: PlayMode;
  onPlayAgain?(): void;
  /** False when re-showing a result from an earlier visit. */
  celebrate?: boolean;
}) {
  const { settings, updateSettings } = useApp();
  const [feedback, setFeedback] = useState<string | null>(null);
  const game = messages.games[result.spec.game];
  const time = formatDuration(result.timeMs);

  const challengeUrl = () => {
    const code = encodeChallenge({
      spec: result.spec,
      timeMs: result.timeMs,
      mistakes: result.mistakes,
      name: settings.playerName || undefined,
      day: mode.kind === "daily" ? mode.day : undefined,
    });
    return `${window.location.origin}/desafio/${code}`;
  };

  const label =
    mode.kind === "daily"
      ? `${game.name} do dia ${parseDayKey(mode.day).toLocaleDateString("pt", { day: "2-digit", month: "2-digit" })}`
      : `${game.name} (${messages.difficulty[result.spec.difficulty]})`;
  const text = result.solved
    ? `🧠 MindArcade · ${label}\n⏱ ${time} · ${result.mistakes} ${result.mistakes === 1 ? "erro" : "erros"}${result.hintsUsed ? ` · ${result.hintsUsed} dicas` : ""}\nConsegue fazer melhor?`
    : `🧠 MindArcade · ${label}\nEste foi difícil! Experimente:`;

  const share = async () => {
    track({ name: "challenge_created", game: result.spec.game });
    const how = await shareText(result.spec.game, text, challengeUrl());
    setFeedback(how === "clipboard" ? "Link copiado! Cole numa conversa." : how === "failed" ? "Não foi possível partilhar." : null);
  };

  const verdict = mode.kind === "challenge" && result.solved ? compareToChallenge(mode.challenge, result.timeMs, result.mistakes) : null;

  return (
    <section className={`result-panel ${result.solved ? "solved" : ""}`} aria-live="polite">
      {celebrate && result.solved && <Confetti />}
      <h2>{result.solved ? "Resolvido! 🎉" : "Fim de jogo"}</h2>
      {result.solved && (
        <dl className="result-stats">
          <div><dt>Tempo</dt><dd>{time}</dd></div>
          <div><dt>Erros</dt><dd>{result.mistakes}</dd></div>
          <div><dt>Dicas</dt><dd>{result.hintsUsed}</dd></div>
        </dl>
      )}
      {verdict && mode.kind === "challenge" && (
        <p className={`verdict verdict-${verdict}`}>
          {VERDICT_TEXT[verdict]} {mode.challenge.name ?? "O seu amigo"} fez {formatDuration(mode.challenge.timeMs)}.
        </p>
      )}
      <div className="share-box">
        <label>
          O seu nome no desafio (opcional)
          <input
            value={settings.playerName}
            maxLength={24}
            placeholder="ex.: Ana"
            onChange={(e) => updateSettings({ playerName: e.target.value })}
          />
        </label>
        <div className="actions">
          <button className="btn primary" onClick={share}>Desafiar um amigo</button>
          <a
            className="btn whatsapp"
            href={whatsappUrl(text, challengeUrl())}
            target="_blank"
            rel="noreferrer"
            onClick={() => track({ name: "share", game: result.spec.game, method: "whatsapp" })}
          >
            WhatsApp
          </a>
          {onPlayAgain && <button className="btn" onClick={onPlayAgain}>Jogar outro</button>}
        </div>
        {feedback && <p className="muted">{feedback}</p>}
      </div>
    </section>
  );
}
