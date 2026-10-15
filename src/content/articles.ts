/**
 * Editorial content ("Revista"). Kept as structured data so it can move to a
 * CMS later without touching pages. Avoids medical promises by design.
 */
export type ArticleCategory = "Mente e psicologia" | "História e cultura" | "Lógica e estratégia" | "Ciência e curiosidades";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  readingMinutes: number;
  /** Paragraphs; lines starting with "## " are subheadings. */
  body: readonly string[];
  relatedGame?: "sudoku" | "wordsearch" | "nonogram" | "riddle" | "sequence";
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "tecnicas-basicas-de-sudoku",
    title: "Cinco técnicas para resolver Sudoku sem adivinhar",
    summary: "Do candidato único aos pares escondidos: o método que os bons jogadores usam em cada partida.",
    category: "Lógica e estratégia",
    readingMinutes: 5,
    relatedGame: "sudoku",
    body: [
      "Um Sudoku bem construído tem uma única solução e pode ser resolvido apenas com lógica. Adivinhar não é necessário — e normalmente atrasa. Estas são as técnicas que resolvem a grande maioria dos puzzles.",
      "## 1. Varrimento",
      "Escolha um número, por exemplo o 5, e percorra cada quadrado 3×3. Se num quadrado só existe uma casa onde o 5 pode ficar sem repetir na linha ou na coluna, encontrou a sua posição.",
      "## 2. Candidato único",
      "Olhe para uma casa vazia e elimine todos os números que já aparecem na sua linha, coluna e quadrado. Se sobrar apenas um, é esse.",
      "## 3. Único lugar na linha ou coluna",
      "É o varrimento aplicado a linhas e colunas: se, numa linha, o 7 só cabe numa casa, o 7 vai para lá — mesmo que essa casa tenha outros candidatos.",
      "## 4. Pares nus",
      "Se duas casas da mesma linha só aceitam {2, 8}, então o 2 e o 8 dessa linha estão ali. Pode apagar o 2 e o 8 de todas as outras casas da linha. Use o modo de notas para os ver.",
      "## 5. Interseções",
      "Se, dentro de um quadrado, todos os candidatos a 4 estão na mesma linha, o 4 dessa linha está nesse quadrado — e pode ser eliminado do resto da linha.",
      "Experimente começar sempre pelo varrimento: é rápido e revela muitas casas. Quando parar de dar resultados, passe às notas.",
    ],
  },
  {
    slug: "como-funciona-a-memoria",
    title: "Como funciona a memória (e porque esquecemos)",
    summary: "Memória de trabalho, memória de longo prazo e o papel da atenção, explicados sem complicação.",
    category: "Mente e psicologia",
    readingMinutes: 6,
    body: [
      "Quando falamos de “memória” estamos, na verdade, a falar de vários sistemas que trabalham em conjunto.",
      "## A memória de trabalho",
      "É o “bloco de notas” da mente: guarda informação durante segundos enquanto a usamos — um número de telefone, os candidatos de uma casa do Sudoku. A sua capacidade é limitada; a investigação clássica fala em poucos elementos ao mesmo tempo.",
      "## A memória de longo prazo",
      "Aqui fica o que aprendemos de forma duradoura: factos, acontecimentos e competências. Passar algo para a memória de longo prazo depende muito da atenção, da repetição espaçada no tempo e de ligar a informação nova ao que já sabemos.",
      "## Porque esquecemos",
      "Esquecer é normal e útil: o cérebro não guarda tudo. Informação pouco usada torna-se mais difícil de recuperar, e memórias parecidas interferem umas com as outras.",
      "## E os passatempos?",
      "Resolver puzzles é uma forma agradável de praticar atenção e raciocínio. Ficamos melhores nas tarefas que treinamos — mas não há evidência sólida de que um jogo, por si só, previna doenças ou aumente o QI. O melhor argumento para jogar é simples: é divertido e estimulante.",
    ],
  },
  {
    slug: "historia-das-palavras-cruzadas-e-passatempos",
    title: "Uma breve história dos passatempos de banca",
    summary: "Das primeiras palavras cruzadas em jornais às revistas que encheram as bancas no século XX.",
    category: "História e cultura",
    readingMinutes: 4,
    relatedGame: "wordsearch",
    body: [
      "Em 1913, o jornal norte-americano New York World publicou um quadro de palavras com pistas que muitos consideram a primeira palavra cruzada moderna. Em poucos anos, a moda atravessou o Atlântico.",
      "## A era das revistas",
      "Ao longo do século XX, as revistas de passatempos tornaram-se presença habitual nas bancas do Brasil e de Portugal: palavras cruzadas, caça-palavras, labirintos, criptogramas e testes de lógica, muitas vezes organizados por nível de dificuldade.",
      "## O Sudoku chega mais tarde",
      "O Sudoku moderno foi publicado nos Estados Unidos no final dos anos 1970 com o nome “Number Place”, ganhou o nome atual no Japão nos anos 1980 e tornou-se um fenómeno mundial em meados dos anos 2000.",
      "## Do papel para o ecrã",
      "O formato digital acrescenta o que o papel não consegue: desafios diários iguais para todos, verificação de erros e a possibilidade de desafiar um amigo com um simples link. O espírito, porém, é o mesmo — uns minutos de concentração e o prazer de chegar à solução.",
    ],
  },
  {
    slug: "o-que-sao-nonogramas",
    title: "Nonogramas: a arte de desenhar com lógica",
    summary: "Como os números à margem revelam uma imagem — e o truque da sobreposição para começar.",
    category: "Lógica e estratégia",
    readingMinutes: 4,
    relatedGame: "nonogram",
    body: [
      "Os nonogramas (também chamados Picross ou Griddlers) surgiram no Japão no final dos anos 1980. Cada linha e coluna traz uma sequência de números: são os comprimentos dos blocos de casas pintadas, por ordem.",
      "## O truque da sobreposição",
      "Numa linha de 10 casas com a pista 7, o bloco pode começar na casa 1, 2, 3 ou 4. Em qualquer caso, as casas 4 a 7 ficam pintadas. Some a pista ao número de espaços obrigatórios; se for maior que metade da linha, há casas garantidas.",
      "## Linhas vazias e completas",
      "Uma pista 0 significa linha toda vazia. Uma pista que, somada aos espaços, ocupa a linha inteira, pinta-a toda de uma vez.",
      "## Marque o que fica vazio",
      "Usar o ✕ para as casas vazias é tão importante como pintar: cada ✕ restringe as hipóteses dos blocos vizinhos. Todos os nonogramas do MindArcade são verificados para que possam ser resolvidos só com lógica.",
    ],
  },
  {
    slug: "porque-o-cerebro-gosta-de-padroes",
    title: "Porque é que o cérebro adora encontrar padrões",
    summary: "Das constelações às sequências numéricas: a tendência humana para procurar ordem.",
    category: "Ciência e curiosidades",
    readingMinutes: 4,
    relatedGame: "sequence",
    body: [
      "Olhamos para nuvens e vemos animais; olhamos para as estrelas e desenhamos constelações. Procurar padrões é uma das coisas que o nosso cérebro faz de forma mais natural.",
      "## Uma vantagem antiga",
      "Reconhecer regularidades — as estações, o comportamento dos animais, as marés — ajudou os nossos antepassados a antecipar o que vinha a seguir. Prever é poupar esforço.",
      "## Quando o padrão engana",
      "A mesma tendência leva-nos a ver padrões onde só há acaso: uma sequência de “caras” numa moeda não torna a próxima “coroa” mais provável. Chama-se a isto falácia do jogador.",
      "## Treinar o olhar",
      "Puzzles de sequências pedem exatamente isto: observar diferenças, testar uma hipótese e confirmar se ela explica todos os termos. Se a regra só funciona para metade dos números, ainda não é a regra certa.",
    ],
  },
];

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
