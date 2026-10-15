import { Link } from "react-router-dom";
import { GAME_IDS } from "../../domain/shared/types";
import { messages } from "../../i18n/messages";
import { GAME_ICONS } from "../games/registry";
import { AdSlot } from "../components/AdSlot";
import { useDocumentTitle } from "../useDocumentTitle";

export function GamesPage() {
  useDocumentTitle("Jogos");
  return (
    <>
      <h1>Biblioteca de jogos</h1>
      <p className="muted">Escolha um jogo e comece já. Partidas ilimitadas em quatro níveis de dificuldade.</p>
      <div className="card-grid">
        {GAME_IDS.map((g) => (
          <Link key={g} to={`/jogos/${messages.games[g].slug}`} className="game-card">
            <span className="game-icon" aria-hidden>{GAME_ICONS[g]}</span>
            <strong>{messages.games[g].name}</strong>
            <span className="muted">{messages.games[g].tagline}</span>
          </Link>
        ))}
      </div>
      <AdSlot placement="list" />
    </>
  );
}
