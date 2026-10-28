# MindArcade — Direção de design

> **"Banca colorida"**: a alegria de uma revista de passatempos nova, com peças de jogo que se
> podem quase pegar. Divertido sem ser infantil, claro sem ser frio.

Este documento é a referência para qualquer ecrã novo. Os valores vivem em `src/styles.css`
(tokens em `:root`); aqui fica o *porquê*.

## 1. Personalidade

| Somos | Não somos |
|---|---|
| Alegres, calorosos, com energia de "mais uma partida" | Infantis, barulhentos, cheios de animações gratuitas |
| Tácteis — botões e peças que parecem físicos | Planos e corporativos |
| Claros — o tabuleiro é sempre o protagonista | Decorados à volta do jogo, a competir com ele |
| Generosos na celebração quando se resolve | Insistentes (sem pop-ups, sem pressão) |

Analogia: o tabuleiro é a página da revista — limpo e legível. A alegria está na *capa*
(início, cartões, resultados), nas *margens* (cor por jogo, autocolantes) e no *momento da vitória*.

## 2. Cor

### Paleta de alegria (igual nos dois temas)

| Token | Cor | Jogo |
|---|---|---|
| `--grape` | `#6C4CF1` | Sudoku · cor da marca |
| `--coral` | `#FF6B6B` | Caça-palavras |
| `--mint`  | `#22C998` | Nonograma |
| `--sun`   | `#FFC83D` | Enigmas · destaques, seleção, streaks |
| `--sky`   | `#3DB8FF` | Sequências · foco do teclado |

Cada jogo declara `data-game="…"` e os componentes leem `--game`. Assim, um jogo novo
ganha identidade apenas com uma linha de CSS.

### Temas

- **Claro** (por omissão): fundo creme `#FFF8EC` com padrão de pontos subtil, que lembra papel de revista.
  Texto em tinta índigo `#241C3D`, nunca preto puro.
- **Escuro**: noite índigo `#15122A`, e não preto, para as cores continuarem a "brilhar".
  A marca clareia para `#8F75FF` para manter o contraste.
- **Automático**: segue o sistema operativo. O jogador muda no botão 🌗/☀️/🌙 do cabeçalho ou em *Progresso → Preferências*.
  A escolha fica guardada e é aplicada antes do primeiro desenho da página (script em `index.html`), para não haver flash.

Regras:
- Só os tokens semânticos (`--bg`, `--surface`, `--text`, `--muted`, `--line`, `--ok`, `--bad`…) mudam entre temas.
  Nunca escrever uma cor literal num componente.
- Texto sobre `--sun` ou `--mint` usa sempre tinta escura (`#241C3D`). Texto sobre `--grape` e `--coral` usa branco.
- Erro = `--bad` + fundo `--bad-soft`. Nunca transmitir erro só pela cor: há também o abanão e o contador.

## 3. Tipografia

- **Títulos e números do jogo:** *Baloo 2* (700–800) — arredondada e simpática, com acentos portugueses completos.
- **Texto e interface:** *Nunito* (400–800) — redonda e muito legível em tamanhos pequenos.
- Números em tabuleiros e cronómetros usam `font-variant-numeric: tabular-nums`, para não "saltarem".
- Escala de títulos: `clamp(1.8rem, 5vw, 2.6rem)` no h1; os títulos ficam densos (`line-height` 1.15).

## 4. Forma e profundidade — "peças tácteis"

- **Contorno de tinta** de 2–3px (`--edge`) em cartões, botões e tabuleiros.
- **Sombra sólida deslocada** (`0 4px 0 var(--edge)`), sem desfoque: lembra peças de jogo de tabuleiro e autocolantes.
- **Premir = afundar:** no `:active`, o elemento desce 3–4px e perde a sombra. É o principal feedback táctil.
- Raios: 10px (campos), 18px (cartões, tabuleiros), 26px (painel de resultado), pílula (etiquetas, nav).
- Pequenas rotações (−6° a +6°) só em elementos decorativos (logótipo, emblema do jogo, peças do início).
  **Nunca no tabuleiro.**

## 5. Movimento

| Momento | Animação |
|---|---|
| Hover em cartão | sobe 3px e inclina −0.6° (curva com ligeiro ressalto) |
| Palavra encontrada / casa pintada / ✓ diário | `pop` — cresce com ressalto |
| Resposta errada | `shake` curto (300ms) |
| Puzzle resolvido | painel sobe (`rise`) + confetti com as 5 cores (~1.5s) |
| Início | peças a flutuar devagar (`bob`, 4s) |

Regras:
- Animações curtas (< 500ms), exceto as decorativas em ciclo lento.
- `prefers-reduced-motion: reduce` desliga **todas** as animações e o confetti.
- O confetti só aparece num resultado acabado de conseguir, não ao rever um desafio de outro dia.

## 6. Componentes-chave

- **Botão** (`.btn`): contorno + profundidade. Variantes: `primary` (uva), `active` (sol), `whatsapp`, `big`.
- **Segmentado** (`.segmented`): dificuldade, tema, ferramenta do nonograma. A opção ativa fica com a cor do jogo.
- **Cartão de jogo**: faixa de topo com a cor do jogo + ícone em "azulejo" tingido.
- **Item diário**: borda esquerda grossa na cor do jogo. Quando concluído, fica com fundo menta e ✓ redondo.
- **Pílulas de estado** no topo do tabuleiro: cronómetro, erros e progresso.
- **Painel de resultado**: o momento mais festivo — gradiente suave para a cor do jogo, estatísticas em blocos, ações de partilha.

## 7. Acessibilidade (inegociável)

- Contraste AA para texto nos dois temas.
- Foco visível: contorno `--sky` de 3px.
- Alvos de toque ≥ 40px no telemóvel (casas do Sudoku, teclas numéricas, botões).
- Estado nunca só por cor: ícones (✓ ✕ 🔥), texto ou animação acompanham sempre.

## 8. O que evitar

- Gradientes fortes, néon e sombras com desfoque grande.
- Mais de duas cores de jogo no mesmo componente.
- Emojis como único conteúdo informativo (são decoração ou reforço).
- Anúncios com o estilo da casa — devem ser claramente distinguíveis (borda tracejada neutra).
