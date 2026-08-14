# Map: multi-idioma com tradução pt-BR

Labels: wayfinder:map

## Destination

O site serve inglês e português do Brasil completos, com troca de idioma persistente e URL própria por idioma (`/` e `/pt-br`), sobre uma arquitetura de i18n em que acrescentar um terceiro idioma é acrescentar um arquivo de tradução.

## Notes

- Domínio: SPA React + Vite de página única (`src/App.tsx`, cinco seções interativas e um slideshow de deep dive), servida por um Worker Cloudflare (`worker/index.ts`) que também expõe `POST /api/name`. Toda a copy hoje é literal inline no JSX.
- Tracker: markdown local — mapa em `.scratch/i18n-pt-br/map.md`, tickets em `.scratch/i18n-pt-br/issues/NN-<slug>.md`.
- Skills a consultar em cada sessão: `wayfinder`, `grilling`, `domain-modeling`; `tdd` não se aplica (repo sem suíte de testes).
- Este mapa carrega execução, não só decisão: os tickets `task` produzem o código, por escolha explícita do dono.
- Verificação disponível: `npm run lint` (oxlint) e `npm run build` (`tsc -b && vite build`). Não há testes automatizados nem typecheck separado.

### Decisões de charting (fixadas na sessão de grilling que criou o mapa)

- **Mecanismo**: solução própria mínima — contexto React + dicionários TS (`en`, `pt-BR`) tipados a partir do objeto `en`, para que o compilador acuse chave faltante ou sobrando. Sem react-i18next, sem dependência nova, sem carregamento assíncrono.
- **Roteamento**: o path define o idioma (`/` = `en`, `/pt-br` = `pt-BR`). A escolha explícita do visitante persiste em `localStorage` e vence a detecção; na primeira visita sem preferência salva, `navigator.language` começando com `pt` redireciona para `/pt-br`.
- **Escopo de tradução**: toda a copy autoral é traduzida. Termos de UI do X (like, repost, quote, For You) e nomes técnicos do algoritmo (Home Mixer, Thunder, Phoenix, SimClusters, favScore) permanecem em inglês, com glosa em português na primeira ocorrência. O conteúdo dos posts em `src/data/tweets.json` não é traduzido. O Worker é traduzido, incluindo pedir ao Grok um nome em pt-BR quando o idioma for pt-BR.
- **Tom do pt-BR**: "você", informal e direto, frases curtas espelhando o ritmo do inglês, sem gerundismo e sem tradução literal.

## Decisions so far

<!-- índice: uma linha por ticket fechado -->

- [Núcleo de i18n: contexto, dicionários tipados e resolução de idioma](issues/01-nucleo-i18n.md) — contexto + dicionários tipados por `typeof en` entregues; `/pt-br` só é autoritativo quando o path nomeia o idioma, `/` cede para a preferência salva e depois para o navegador; redirecionamento por `replaceState` (sem recarregar) e troca por `pushState`; `not_found_handling: single-page-application` no Worker.

## Not yet specified

- Revisão humana da tradução: se a copy longa do deep dive precisa de uma passada de revisão por um falante nativo antes de ir ao ar, e como essa revisão entra no fluxo. Só fica claro quando o pt-BR existir para ser lido.
- Comportamento dos números e datas em pt-BR além de `toLocaleString` (percentuais, separador decimal nas seções interativas) — o alcance real aparece durante a extração da copy.

## Out of scope

- Idiomas além de en e pt-BR: a arquitetura tem de permitir, mas nenhum terceiro idioma é entregue neste esforço.
- Posts de exemplo em português: `src/data/tweets.json` vem da API do xAI em inglês e permanece assim; buscar posts em português é outro esforço.
- Renderização no servidor / pré-render por idioma para SEO completo: o site é SPA e continua assim; metadados por idioma são resolvidos no client.
