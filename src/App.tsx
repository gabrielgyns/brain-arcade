import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./app/store";
import { Layout } from "./ui/components/Layout";
import { HomePage } from "./ui/pages/HomePage";
import { GamesPage } from "./ui/pages/GamesPage";
import { PlayPage } from "./ui/pages/PlayPage";
import { DailyHubPage, DailyPlayPage } from "./ui/pages/DailyPage";
import { ChallengePage } from "./ui/pages/ChallengePage";
import { StatsPage } from "./ui/pages/StatsPage";
import { ArticlePage, MagazinePage } from "./ui/pages/MagazinePage";
import { AboutPage, NotFoundPage } from "./ui/pages/AboutPage";

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="jogos" element={<GamesPage />} />
            <Route path="jogos/:slug" element={<PlayPage />} />
            <Route path="diario" element={<DailyHubPage />} />
            <Route path="diario/:slug" element={<DailyPlayPage />} />
            <Route path="desafio/:code" element={<ChallengePage />} />
            <Route path="estatisticas" element={<StatsPage />} />
            <Route path="revista" element={<MagazinePage />} />
            <Route path="revista/:slug" element={<ArticlePage />} />
            <Route path="sobre" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
