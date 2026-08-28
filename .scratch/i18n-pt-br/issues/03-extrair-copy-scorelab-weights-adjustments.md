# Extrair a copy de ScoreLab, Weights e Adjustments

Type: task
Status: resolved
Blocked by: 01

## Question

A copy de `src/sections/ScoreLab.tsx`, `src/sections/Weights.tsx` e `src/sections/Adjustments.tsx` passa a vir do dicionário?

Cobre títulos, ledes, textos de ajuda, rótulos das ações do laboratório de score, rótulos e legendas do gráfico de pesos e os cards de ajuste. Os nomes de ação que espelham a UI do X (like, reply, repost, quote, share, copy link, follow, mute, block, report) entram no dicionário como chaves, mesmo que o valor em pt-BR permaneça o termo em inglês — a decisão de traduzir ou glosar cada um é do ticket 05.

Critério: nenhum literal visível resta nesses três arquivos; build e lint passam; a versão em inglês não muda.

## Answer

As três seções leem tudo do dicionário.

- Os nomes de ação viraram chaves compartilhadas em `copy.actions` (`like`, `reply`, `replyMutual`, `repost`, `quote`, `share`, `shareDm`, `copyLink`, `follow`, `click`, `video`, `notInterested`, `block`, `mute`, `report`), consumidas por `ScoreLab`, `Weights` e `WeightLab` — um único lugar para a decisão do ticket 05.
- `ACTIONS`/`WEIGHTS` guardam só `id` + peso, tipados como `keyof Copy['actions']`, então um id errado é erro de compilação.
- Valores numéricos passam por `useFormat()` (`src/i18n/format.ts`): em pt-BR o peso aparece como `+0,5` e a pontuação como `-58,8` (o sinal é o do `Intl`, não o menos tipográfico).
- Em `Adjustments`, os rótulos e as marcas das barras (`×1,0`, `×0,75`) estão no dicionário, porque o separador decimal muda com o idioma.
