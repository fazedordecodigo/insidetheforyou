# Escrever a tradução pt-BR completa

Type: task
Status: resolved
Blocked by: 05

## Question

`src/i18n/pt-BR.ts` cobre todas as chaves com tradução que respeita o tom decidido e o glossário?

Regras: "você", informal e direto, frases curtas espelhando o ritmo do inglês, sem gerundismo, sem tradução literal; glossário do ticket 05 aplicado de forma consistente, com glosa apenas na primeira ocorrência de cada termo; números e percentuais formatados para pt-BR onde o texto os apresenta.

Critério: o compilador não acusa nenhuma chave faltante ou extra em relação a `en`; `/pt-br` renderiza a página inteira em português, sem nenhum resquício em inglês fora dos termos do glossário; nenhum layout quebra por texto mais longo (o português cresce ~20%).

## Answer

Sim. `src/i18n/pt-BR.ts` é declarado como `Copy`, então `tsc -b` já garante paridade de chaves com
`en` — não existe chave faltante nem extra. A tradução foi escrita nos tickets 02–04 e revisada aqui
contra o glossário fechado no 05; a revisão não achou nenhum desvio de tratamento, só três ajustes
de regência e naturalidade:

- `hero.lede`: "um algoritmo monta ele do zero" → "monta esse feed do zero".
- `signals.items`: "você assistiu um vídeo" → "assistiu a um vídeo", casando com o rótulo
  "Assistir ao vídeo".
- `demoFeed.posts.octo`: "assistiu 3 vídeos" → "assistiu a 3 vídeos".

Os dois critérios de renderização já tinham sido verificados no navegador ao fim do ticket 04:
`/pt-br` inteira em português sem resquício fora do glossário, sem string vazia, `undefined` ou
`[object`, e sem quebra de layout a 375px (a barra de abas do Deep Dive rola na horizontal de
propósito). Números passam por `useFormat()`, com vírgula decimal em pt-BR.

O que fica fora por decisão, não por omissão: os posts reais de `src/data/tweets.json` seguem em
inglês, porque são conteúdo de terceiros.
