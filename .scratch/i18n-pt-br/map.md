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
- **Escopo de tradução**: toda a copy autoral é traduzida. Termos de UI do X (like, repost, quote, For You) e nomes técnicos do algoritmo (Home Mixer, Thunder, Phoenix, SimClusters, favScore) permanecem em inglês, com glosa em português na primeira ocorrência. **Emendado no ticket 05**: os rótulos de ação do X passam a usar o rótulo oficial do X em pt-BR (Curtir, Repostar, Citar, Silenciar, Denunciar), porque o app em português já os traduz; a regra de "inglês com glosa" segue valendo para nomes de sistema e jargão sem rótulo oficial. O conteúdo dos posts em `src/data/tweets.json` não é traduzido. O Worker é traduzido, incluindo pedir ao Grok um nome em pt-BR quando o idioma for pt-BR.
- **Tom do pt-BR**: "você", informal e direto, frases curtas espelhando o ritmo do inglês, sem gerundismo e sem tradução literal.

## Decisions so far

<!-- índice: uma linha por ticket fechado -->

- [Núcleo de i18n: contexto, dicionários tipados e resolução de idioma](issues/01-nucleo-i18n.md) — contexto + dicionários tipados por `typeof en` entregues; `/pt-br` só é autoritativo quando o path nomeia o idioma, `/` cede para a preferência salva e depois para o navegador; redirecionamento por `replaceState` (sem recarregar) e troca por `pushState`; `not_found_handling: single-page-application` no Worker.
- [Extrair a copy de App.tsx para o dicionário en](issues/02-extrair-copy-app.md) — ênfase virou par de chaves `title`/`titleDim`; listas e abas do deep dive por chaves estáveis; `Visibility` destaca por posição, não por texto; números dos `Predictions` fora do dicionário.
- [Extrair a copy de ScoreLab, Weights e Adjustments](issues/03-extrair-copy-scorelab-weights-adjustments.md) — nomes de ação centralizados em `copy.actions` e consumidos pelas três seções; constantes guardam id + peso; valores numéricos por `useFormat()`.
- [Extrair a copy de DemoFeed, ActionEffects e WeightLab](issues/04-extrair-copy-demofeed-weightlab.md) — posts anotados, tópicos, presets e posts do playground por id; resumo dinâmico com funções no dicionário (plural em pt-BR); posts reais intocados.
- [Glossário pt-BR dos termos técnicos e de UI do X](issues/05-glossario-pt-br.md) — tabela fechada em `glossario.md` com cinco tratamentos; rótulos de ação seguem o app do X em pt-BR (emenda ao charting); nomes de sistema em inglês puro; ranker, transformer e dwell em inglês com glosa.
- [Escrever a tradução pt-BR completa](issues/06-traducao-pt-br.md) — paridade de chaves garantida pelo compilador via `ptBR: Copy`; revisão contra o glossário achou só três ajustes de regência; posts reais seguem em inglês por decisão.
- [Worker em pt-BR: labels e prompt do Grok](issues/08-worker-pt-br.md) — `locale` opcional validado contra a lista fechada; `LABELS` por idioma; nome pedido ao Grok no idioma ativo.

## Not yet specified

- Revisão humana da tradução: os tickets 05 e 06 fecharam o glossário e a revisão contra ele, mas nenhum falante nativo além do dono leu a prosa longa do deep dive. Falta decidir se essa leitura acontece antes de ir ao ar.

## Out of scope

- Idiomas além de en e pt-BR: a arquitetura tem de permitir, mas nenhum terceiro idioma é entregue neste esforço.
- Posts de exemplo em português: `src/data/tweets.json` vem da API do xAI em inglês e permanece assim; buscar posts em português é outro esforço.
- Renderização no servidor / pré-render por idioma para SEO completo: o site é SPA e continua assim; metadados por idioma são resolvidos no client.
