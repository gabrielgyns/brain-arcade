import { Link } from "react-router-dom";
import { useDocumentTitle } from "../useDocumentTitle";

export function AboutPage() {
  useDocumentTitle("Sobre");
  return (
    <article className="article">
      <h1>Sobre o MindArcade</h1>
      <p className="lead">Um lugar para jogar cinco minutos e encontrar motivos para voltar no dia seguinte.</p>
      <p>
        O MindArcade traz para o ecrã a experiência dos livros e revistas de passatempos: Sudoku, caça-palavras,
        nonogramas e enigmas, com desafios diários iguais para todos e a possibilidade de desafiar amigos.
      </p>
      <h2>Princípios</h2>
      <ul>
        <li>Grátis e sem conta obrigatória — o progresso fica guardado neste dispositivo.</li>
        <li>Qualidade acima de quantidade: cada puzzle é gerado e verificado para ter solução lógica.</li>
        <li>Publicidade discreta, nunca a interromper uma partida.</li>
        <li>Sem promessas milagrosas: jogamos porque é divertido e estimulante.</li>
      </ul>
      <Link to="/diario" className="btn primary">Jogar o desafio do dia</Link>
    </article>
  );
}

export function NotFoundPage() {
  useDocumentTitle("Página não encontrada");
  return (
    <div className="empty-state">
      <h1>Esta página fugiu do tabuleiro</h1>
      <Link to="/" className="btn primary">Voltar ao início</Link>
    </div>
  );
}
