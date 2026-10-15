import type { Locale } from "../shared/types";

/**
 * A word may be shared by both variants of Portuguese or differ between them
 * (e.g. "ônibus" in Brazil, "autocarro" in Portugal).
 */
export type ThemeWord = string | Readonly<Record<Locale, string>>;

export interface WordTheme {
  id: string;
  title: string;
  words: readonly ThemeWord[];
}

export function resolveWord(word: ThemeWord, locale: Locale): string {
  return typeof word === "string" ? word : word[locale];
}

export const THEMES: readonly WordTheme[] = [
  {
    id: "animais",
    title: "Animais",
    words: [
      "girafa", "elefante", "tartaruga", "golfinho", "coruja", "jacaré", "tucano", "leopardo",
      "camelo", "pinguim", "esquilo", "morcego", "cavalo", "baleia", "abelha", "formiga",
      "raposa", "lagosta", "flamingo", "polvo", { "pt-BR": "camundongo", "pt-PT": "ratinho" },
    ],
  },
  {
    id: "geografia",
    title: "Geografia",
    words: [
      "montanha", "planalto", "deserto", "oceano", "arquipélago", "península", "vulcão", "floresta",
      "cordilheira", "equador", "meridiano", "latitude", "continente", "estreito", "delta", "savana",
      "tundra", "lagoa", "planície", "geleira",
    ],
  },
  {
    id: "historia",
    title: "História",
    words: [
      "império", "faraó", "renascimento", "revolução", "navegações", "caravela", "monarquia",
      "república", "cruzadas", "feudalismo", "iluminismo", "independência", "colônia", "pirâmide",
      "gladiador", "cavaleiro", "castelo", "pergaminho", "dinastia", "abolição",
    ],
  },
  {
    id: "ciencia",
    title: "Ciência",
    words: [
      "átomo", "molécula", "gravidade", "célula", "energia", "planeta", "galáxia", "fotossíntese",
      "evolução", "elétron", "proteina", "bactéria", "magnetismo", "partícula", "telescópio",
      "neurônio", "cometa", "oxigênio", "carbono", "genética",
    ],
  },
  {
    id: "cotidiano",
    title: "Dia a dia",
    words: [
      { "pt-BR": "ônibus", "pt-PT": "autocarro" },
      { "pt-BR": "trem", "pt-PT": "comboio" },
      { "pt-BR": "geladeira", "pt-PT": "frigorífico" },
      { "pt-BR": "celular", "pt-PT": "telemóvel" },
      { "pt-BR": "sorvete", "pt-PT": "gelado" },
      { "pt-BR": "banheiro", "pt-PT": "casa de banho" },
      { "pt-BR": "café da manhã", "pt-PT": "pequeno-almoço" },
      { "pt-BR": "suco", "pt-PT": "sumo" },
      { "pt-BR": "grama", "pt-PT": "relva" },
      { "pt-BR": "terno", "pt-PT": "fato" },
      "mercado", "padaria", "escola", "jardim", "cozinha", "janela", "chaveiro", "mochila",
      "guarda-chuva", "caneca",
    ],
  },
];

export function findTheme(id: string): WordTheme | undefined {
  return THEMES.find((t) => t.id === id);
}
