# MindArcade

Plataforma web de jogos, passatempos e desafios mentais em português (pt-BR e pt-PT).
Este repositório contém o **MVP**: Sudoku, caça-palavras, nonograma, enigmas e sequências,
desafio diário, "Desafiar um amigo", estatísticas locais e uma revista inicial.

## Começar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes do domínio (geradores, validadores, streaks, links)
npm run build      # typecheck + build de produção em dist/
```

Site estático — qualquer CDN serve. `vercel.json` e `public/_redirects` (Netlify/Cloudflare Pages)
reencaminham todas as rotas para `index.html`.

## Design

A direção visual ("Banca colorida"), os tokens, os temas claro/escuro e as regras de movimento e acessibilidade estão em [`DESIGN.md`](DESIGN.md).

## Arquitetura

O código está organizado de dentro para fora: um **domínio** puro em TypeScript, sem React nem browser,
e uma camada de UI fina por cima.

```
src/
  domain/              regras do jogo — puras, determinísticas, testadas
    shared/            PuzzleSpec, PlayResult, RNG com seed, datas
    sudoku/            gerador com solução única garantida, conflitos, dicas
    wordsearch/        gerador por tema, variantes pt-BR / pt-PT
    nonogram/          gerador + solver por linhas (só aceita puzzles resolúveis sem adivinhar)
    riddle/            coleção curada de enigmas + gerador de sequências
    daily/             desafio do dia = função pura da data
    challenge/         codificação do link "Desafiar um amigo"
    progress/          histórico, estatísticas, streaks
  infra/               localStorage, analytics (sink plugável), partilha
  app/                 estado React (definições, progresso), cronómetro, jogos guardados
  ui/                  layout, páginas e um componente por jogo
  content/             artigos da revista
  i18n/                textos da interface (preparado para en/es)
```

### Ideias-chave

- **Um `PuzzleSpec` (`jogo + dificuldade + seed + variante`) reproduz um puzzle exatamente.**
  É isso que permite o desafio diário igual para todos e os links de desafio sem servidor nem conta.
- **Desafio diário:** a seed deriva da data (`hash("mindarcade:2026-10-15:sudoku")`); a dificuldade
  sobe ao longo da semana (seg/ter fácil → sáb/dom difícil). Os enigmas diários percorrem a coleção
  inteira antes de repetir.
- **Desafiar um amigo:** `/desafio/s~m~1xcure3~BR~4k~0~Ana~2026-10-15` contém o puzzle, o tempo a
  bater e o nome. O amigo joga imediatamente, sem conta, e vê quem ganhou.
- **Validação dos puzzles:** Sudoku verificado com contagem de soluções (=1); nonogramas aceites só
  se o solver por linhas os resolver totalmente; palavras verificadas letra a letra nos testes.
- **Progresso local:** jogos em curso são guardados automaticamente (fechar o separador não perde nada);
  o formato de `PlayerProgress` foi pensado para ser sincronizado com uma conta mais tarde.
- **Métricas:** `infra/analytics.ts` emite `page_view`, `game_start`, `game_complete`, `share`,
  `challenge_created` com um id anónimo por dispositivo. Por omissão ficam em localStorage;
  `registerSink()` liga um fornecedor (Plausible, PostHog, GA4…).
- **Publicidade:** `AdSlot` existe nas páginas de lista, artigos e entre partidas — nunca no
  tabuleiro. Desligado até `VITE_ADS_ENABLED=true`.

## Próximos passos sugeridos

1. **SEO:** pré-renderizar (SSG) as páginas de jogo e artigos — hoje é uma SPA, o que limita a indexação.
2. **Analytics real:** escolher um fornecedor compatível com RGPD/LGPD e registar o sink.
3. **Dificuldade do Sudoku por técnicas:** hoje é por número de pistas; classificar pelas técnicas
   necessárias dá níveis mais consistentes.
4. Mais conteúdo: temas de caça-palavras, enigmas, imagens de nonograma e artigos.
5. Imagens de partilha (OG) por resultado e newsletter.
