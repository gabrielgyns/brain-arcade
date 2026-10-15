import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../app/store";
import { track } from "../../infra/analytics";

export function Layout() {
  const location = useLocation();
  const { settings, updateSettings } = useApp();

  useEffect(() => {
    track({ name: "page_view", path: location.pathname });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="MindArcade — início">
          <span className="brand-mark" aria-hidden>M</span>
          <span>MindArcade</span>
        </Link>
        <nav className="main-nav" aria-label="Principal">
          <NavLink to="/diario">Hoje</NavLink>
          <NavLink to="/jogos">Jogos</NavLink>
          <NavLink to="/revista">Revista</NavLink>
          <NavLink to="/estatisticas">Progresso</NavLink>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          MindArcade — passatempos e desafios para quem gosta de pensar. Grátis, sem conta.
        </p>
        <div className="footer-row">
          <Link to="/sobre">Sobre</Link>
          <label className="locale-pick">
            Variante:
            <select
              value={settings.locale}
              onChange={(e) => updateSettings({ locale: e.target.value as typeof settings.locale })}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="pt-PT">Português (Portugal)</option>
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}
