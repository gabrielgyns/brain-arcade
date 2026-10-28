import { useApp, type ThemePreference } from "../../app/store";

const ORDER: ThemePreference[] = ["system", "light", "dark"];
const LABEL: Record<ThemePreference, { icon: string; text: string }> = {
  system: { icon: "🌗", text: "Tema automático" },
  light: { icon: "☀️", text: "Tema claro" },
  dark: { icon: "🌙", text: "Tema escuro" },
};

/** Cycles automático → claro → escuro. */
export function ThemeToggle() {
  const { settings, updateSettings } = useApp();
  const current = LABEL[settings.theme];
  const next = ORDER[(ORDER.indexOf(settings.theme) + 1) % ORDER.length]!;
  return (
    <button
      className="theme-toggle"
      onClick={() => updateSettings({ theme: next })}
      aria-label={`${current.text}. Mudar para ${LABEL[next].text.toLowerCase()}`}
      title={current.text}
    >
      <span aria-hidden>{current.icon}</span>
    </button>
  );
}
