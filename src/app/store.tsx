import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale, PlayResult } from "../domain/shared/types";
import { EMPTY_PROGRESS, recordResult, type PlayerProgress } from "../domain/progress/progress";
import { readJson, writeJson } from "../infra/storage";

export interface Settings {
  locale: Locale;
  showTimer: boolean;
  highlightErrors: boolean;
  playerName: string;
}

function detectLocale(): Locale {
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase() === "pt-pt" ? "pt-PT" : "pt-BR";
}

const DEFAULT_SETTINGS: Settings = { locale: detectLocale(), showTimer: true, highlightErrors: true, playerName: "" };

interface AppState {
  settings: Settings;
  updateSettings(patch: Partial<Settings>): void;
  progress: PlayerProgress;
  addResult(result: PlayResult): void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...readJson("settings", {}) }));
  const [progress, setProgress] = useState<PlayerProgress>(() => readJson("progress", EMPTY_PROGRESS));

  useEffect(() => writeJson("settings", settings), [settings]);
  useEffect(() => writeJson("progress", progress), [progress]);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
  }, [settings.locale]);

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const addResult = useCallback((r: PlayResult) => setProgress((p) => recordResult(p, r)), []);

  const value = useMemo(() => ({ settings, updateSettings, progress, addResult }), [settings, updateSettings, progress, addResult]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}
