import { Link, useParams } from "react-router-dom";
import { decodeChallenge } from "../../domain/challenge/challenge";
import { GameShell } from "../components/GameShell";
import { GAME_COMPONENTS } from "../games/registry";
import { messages } from "../../i18n/messages";
import { useDocumentTitle } from "../useDocumentTitle";

/** Landing page for a "Desafiar um amigo" link — playable instantly, no account. */
export function ChallengePage() {
  const { code = "" } = useParams();
  const challenge = decodeChallenge(code);
  useDocumentTitle(challenge ? `Desafio: ${messages.games[challenge.spec.game].name}` : "Desafio inválido");

  if (!challenge) {
    return (
      <div className="empty-state">
        <h1>Este link de desafio não é válido</h1>
        <p>Pode ter sido cortado ao copiar. Que tal o desafio de hoje?</p>
        <Link to="/diario" className="btn primary">Ir para o desafio do dia</Link>
      </div>
    );
  }

  return (
    <GameShell
      key={code}
      game={GAME_COMPONENTS[challenge.spec.game]}
      props={{ spec: challenge.spec, mode: { kind: "challenge", challenge } }}
    />
  );
}
