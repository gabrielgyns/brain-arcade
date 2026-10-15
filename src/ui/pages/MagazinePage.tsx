import { Link, useParams } from "react-router-dom";
import { ARTICLES, articleBySlug } from "../../content/articles";
import { messages } from "../../i18n/messages";
import { AdSlot } from "../components/AdSlot";
import { useDocumentTitle } from "../useDocumentTitle";

export function MagazinePage() {
  useDocumentTitle("Revista", "Artigos sobre lógica, memória, história e curiosidades.");
  return (
    <>
      <h1>Revista</h1>
      <p className="muted">Curiosidades, história, ciência e estratégias para resolver melhor.</p>
      <div className="article-list">
        {ARTICLES.map((a) => (
          <Link key={a.slug} to={`/revista/${a.slug}`} className="article-card">
            <span className="tag">{a.category}</span>
            <strong>{a.title}</strong>
            <span className="muted">{a.summary}</span>
            <span className="muted small">{a.readingMinutes} min de leitura</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ArticlePage() {
  const { slug = "" } = useParams();
  const article = articleBySlug(slug);
  useDocumentTitle(article?.title ?? "Artigo não encontrado", article?.summary);

  if (!article) {
    return (
      <div className="empty-state">
        <h1>Artigo não encontrado</h1>
        <Link to="/revista" className="btn">Voltar à revista</Link>
      </div>
    );
  }

  return (
    <article className="article">
      <Link to="/revista" className="back-link">← Revista</Link>
      <span className="tag">{article.category}</span>
      <h1>{article.title}</h1>
      <p className="lead">{article.summary}</p>
      {article.body.map((p, i) =>
        p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : <p key={i}>{p}</p>,
      )}
      {article.relatedGame && (
        <Link to={`/jogos/${messages.games[article.relatedGame].slug}`} className="btn primary">
          Jogar {messages.games[article.relatedGame].name} →
        </Link>
      )}
      <AdSlot placement="article" />
    </article>
  );
}
