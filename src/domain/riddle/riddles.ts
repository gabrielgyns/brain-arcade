import type { Difficulty } from "../shared/types";

export type RiddleCategory = "lógica" | "matemática" | "dedução" | "mistério" | "lateral";

export interface Riddle {
  id: string;
  category: RiddleCategory;
  difficulty: Difficulty;
  question: string;
  /** Accepted answers; compared after normalisation (case, accents, articles). */
  answers: readonly string[];
  hint: string;
  explanation: string;
}

export const RIDDLES: readonly Riddle[] = [
  {
    id: "velas",
    category: "lateral",
    difficulty: "easy",
    question: "Numa sala havia 10 velas acesas. Entrou uma corrente de ar e apagou 3. Quantas velas sobram no fim da noite?",
    answers: ["3", "três"],
    hint: "Pense no que acontece às velas que ficam acesas.",
    explanation: "As 7 que continuaram acesas derretem até ao fim. Só sobram as 3 que se apagaram.",
  },
  {
    id: "bola-taco",
    category: "matemática",
    difficulty: "medium",
    question: "Um taco e uma bola custam 1,10 no total. O taco custa 1,00 a mais do que a bola. Quanto custa a bola (em cêntimos/centavos)?",
    answers: ["5", "0,05", "0.05", "5 centavos", "5 cêntimos", "cinco"],
    hint: "Se a bola custasse 10, o taco custaria 1,10. Some os dois.",
    explanation: "Bola = x, taco = x + 1,00. Então 2x + 1,00 = 1,10, logo x = 0,05.",
  },
  {
    id: "irmaos",
    category: "dedução",
    difficulty: "easy",
    question: "A Ana tem 4 irmãos. Cada um dos irmãos tem 1 irmã. Quantos filhos tem a mãe da Ana?",
    answers: ["5", "cinco"],
    hint: "Quem é a irmã de cada um dos irmãos?",
    explanation: "A irmã de todos os irmãos é a própria Ana: 4 rapazes + Ana = 5 filhos.",
  },
  {
    id: "nenufares",
    category: "matemática",
    difficulty: "hard",
    question: "Num lago, uma mancha de nenúfares duplica de tamanho todos os dias. Ao fim de 48 dias cobre o lago inteiro. Em que dia cobria metade do lago?",
    answers: ["47", "dia 47", "quadragésimo sétimo"],
    hint: "Ande um dia para trás a partir do lago cheio.",
    explanation: "Se duplica a cada dia, um dia antes de cobrir tudo cobria metade: dia 47.",
  },
  {
    id: "maquinas",
    category: "matemática",
    difficulty: "hard",
    question: "5 máquinas fazem 5 peças em 5 minutos. Quanto tempo levam 100 máquinas a fazer 100 peças (em minutos)?",
    answers: ["5", "cinco", "5 minutos"],
    hint: "Quanto tempo uma única máquina leva para fazer uma peça?",
    explanation: "Cada máquina faz 1 peça em 5 minutos. 100 máquinas fazem 100 peças nos mesmos 5 minutos.",
  },
  {
    id: "corrida",
    category: "lateral",
    difficulty: "easy",
    question: "Numa corrida, você ultrapassa a pessoa que estava em segundo lugar. Em que posição fica?",
    answers: ["2", "segundo", "segunda", "segundo lugar", "2º"],
    hint: "Você não ultrapassou o primeiro.",
    explanation: "Ocupa o lugar de quem ultrapassou: o segundo.",
  },
  {
    id: "meses-28",
    category: "lateral",
    difficulty: "easy",
    question: "Alguns meses têm 31 dias, outros 30. Quantos meses têm 28 dias?",
    answers: ["12", "doze", "todos"],
    hint: "A pergunta não diz 'apenas 28'.",
    explanation: "Todos os 12 meses têm pelo menos 28 dias.",
  },
  {
    id: "relogio",
    category: "matemática",
    difficulty: "medium",
    question: "Um relógio leva 6 segundos a dar 6 badaladas. Quantos segundos leva a dar 12 badaladas?",
    answers: ["13,2", "13.2", "66/5"],
    hint: "Conte os intervalos entre badaladas, não as badaladas.",
    explanation: "6 badaladas têm 5 intervalos de 1,2 s. 12 badaladas têm 11 intervalos: 11 × 1,2 = 13,2 s.",
  },
  {
    id: "caixas-rotulos",
    category: "dedução",
    difficulty: "expert",
    question:
      "Há três caixas: 'Maçãs', 'Laranjas' e 'Mistura'. Todos os rótulos estão errados. Pode tirar uma única fruta de uma única caixa. De qual caixa deve tirar para descobrir o conteúdo de todas?",
    answers: ["mistura", "da mistura", "caixa mistura"],
    hint: "Qual rótulo, sendo falso, lhe dá mais informação?",
    explanation:
      "A caixa 'Mistura' contém só um tipo de fruta. Se sair uma maçã, é a das maçãs; a rotulada 'Laranjas' não pode ter laranjas, logo é a mistura, e a última é a das laranjas.",
  },
  {
    id: "pai-filho",
    category: "matemática",
    difficulty: "medium",
    question: "Hoje o pai tem o triplo da idade do filho. Daqui a 12 anos terá o dobro. Quantos anos tem o filho hoje?",
    answers: ["12", "doze"],
    hint: "Escreva: P = 3F e P + 12 = 2(F + 12).",
    explanation: "3F + 12 = 2F + 24, logo F = 12 (e o pai tem 36).",
  },
  {
    id: "ponte",
    category: "lógica",
    difficulty: "expert",
    question:
      "Quatro pessoas precisam de atravessar uma ponte à noite com uma só lanterna. A ponte aguenta duas pessoas de cada vez e quem atravessa precisa da lanterna. Demoram 1, 2, 5 e 10 minutos; um par anda ao ritmo do mais lento. Qual é o tempo mínimo total (em minutos)?",
    answers: ["17", "dezassete", "dezessete"],
    hint: "Os dois mais lentos devem atravessar juntos.",
    explanation: "1+2 vão (2), 1 volta (1), 5+10 vão (10), 2 volta (2), 1+2 vão (2): 17 minutos.",
  },
  {
    id: "mentirosos",
    category: "dedução",
    difficulty: "hard",
    question:
      "Numa ilha, os cavaleiros dizem sempre a verdade e os patifes mentem sempre. A diz: 'Pelo menos um de nós dois é patife.' O que é A?",
    answers: ["cavaleiro", "um cavaleiro"],
    hint: "Um patife poderia dizer uma frase verdadeira?",
    explanation: "Se A fosse patife, a frase seria verdadeira — impossível. Logo A é cavaleiro (e B é patife).",
  },
  {
    id: "ovos",
    category: "lateral",
    difficulty: "medium",
    question: "Se 3 galinhas põem 3 ovos em 3 dias, quantos ovos põem 6 galinhas em 6 dias?",
    answers: ["12", "doze"],
    hint: "Descubra quantos ovos uma galinha põe por dia.",
    explanation: "Cada galinha põe 1 ovo a cada 3 dias. 6 galinhas × 2 ovos cada = 12.",
  },
  {
    id: "diario",
    category: "mistério",
    difficulty: "hard",
    question:
      "O detetive encontrou um diário com uma entrada de 'segunda, 31 de abril'. Disse imediatamente que era falso. Porquê? Responda com o mês e o número de dias que ele tem.",
    answers: ["abril tem 30 dias", "abril 30", "30", "abril tem 30"],
    hint: "Recite os meses e os seus dias.",
    explanation: "Abril tem apenas 30 dias — não existe 31 de abril.",
  },
  {
    id: "numero-misterio",
    category: "matemática",
    difficulty: "medium",
    question: "Sou um número de dois algarismos. A soma dos meus algarismos é 11 e, invertendo-os, fico 27 unidades maior. Quem sou?",
    answers: ["47", "quarenta e sete"],
    hint: "Inverter aumenta 9 × (diferença entre algarismos).",
    explanation: "A diferença é 27 / 9 = 3 e a soma é 11: algarismos 4 e 7 → 47 (74 − 47 = 27).",
  },
  {
    id: "elevador",
    category: "mistério",
    difficulty: "expert",
    question:
      "Um homem vive no 10.º andar. Todas as manhãs desce de elevador. Ao voltar, sobe de elevador só até ao 7.º e vai a pé o resto — exceto em dias de chuva, em que vai direto ao 10.º. Porquê? Diga o que ele traz nos dias de chuva.",
    answers: ["guarda-chuva", "guarda chuva", "um guarda-chuva", "chapéu de chuva"],
    hint: "Pense na altura do homem.",
    explanation: "É baixo e não chega ao botão do 10.º — nos dias de chuva usa o guarda-chuva para carregar nele.",
  },
];

export function normalizeAnswer(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^(o|a|os|as|um|uma)\s+/, "")
    .replace(/[^a-z0-9,.\/\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkRiddleAnswer(riddle: Riddle, input: string): boolean {
  const given = normalizeAnswer(input);
  return given.length > 0 && riddle.answers.some((a) => normalizeAnswer(a) === given);
}
