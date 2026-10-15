import type { Difficulty, GameId } from "../domain/shared/types";

/**
 * UI copy lives here (not inline) so English/Spanish can be added later by
 * providing another `Messages` object. The Portuguese text is written to read
 * naturally in both Brazil and Portugal; regional differences belong in
 * content (word lists), not in the interface.
 */
export interface GameInfo {
  name: string;
  tagline: string;
  slug: string;
  howTo: string[];
}

export interface Messages {
  difficulty: Record<Difficulty, string>;
  games: Record<GameId, GameInfo>;
}

export const pt: Messages = {
  difficulty: { easy: "Fácil", medium: "Médio", hard: "Difícil", expert: "Especialista" },
  games: {
    sudoku: {
      name: "Sudoku",
      tagline: "O clássico 9×9 de números e lógica.",
      slug: "sudoku",
      howTo: [
        "Preencha cada linha, coluna e quadrado 3×3 com os números de 1 a 9, sem repetir.",
        "Use o modo de notas para apontar candidatos numa casa.",
        "Cada puzzle tem uma única solução — nunca é preciso adivinhar.",
      ],
    },
    wordsearch: {
      name: "Caça-palavras",
      tagline: "Encontre as palavras escondidas por temas.",
      slug: "caca-palavras",
      howTo: [
        "Arraste (ou toque na primeira e na última letra) para selecionar uma palavra.",
        "As palavras podem estar na horizontal, vertical, diagonal e, nos níveis difíceis, de trás para a frente.",
        "Acentos e espaços são ignorados na grelha.",
      ],
    },
    nonogram: {
      name: "Nonograma",
      tagline: "Pinte as casas certas e revele uma imagem.",
      slug: "nonograma",
      howTo: [
        "Os números de cada linha e coluna indicam os blocos de casas pintadas, por ordem.",
        "Entre blocos há pelo menos uma casa vazia.",
        "Marque com ✕ as casas que tem a certeza de que ficam vazias.",
        "Todos os puzzles se resolvem só com lógica, sem tentativa e erro.",
      ],
    },
    riddle: {
      name: "Enigmas",
      tagline: "Desafios de lógica, dedução e pensamento lateral.",
      slug: "enigmas",
      howTo: ["Leia com atenção, escreva a sua resposta e confirme.", "Está preso? Peça uma pista."],
    },
    sequence: {
      name: "Sequências",
      tagline: "Descubra o padrão e o próximo número.",
      slug: "sequencias",
      howTo: ["Observe como os números mudam de um termo para o seguinte.", "Escreva o número que vem a seguir."],
    },
  },
};

export const messages = pt;

export function gameBySlug(slug: string): GameId | undefined {
  return (Object.keys(pt.games) as GameId[]).find((g) => pt.games[g].slug === slug);
}
