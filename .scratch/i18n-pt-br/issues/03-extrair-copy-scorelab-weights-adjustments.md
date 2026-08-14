# Extrair a copy de ScoreLab, Weights e Adjustments

Type: task
Status:
Blocked by: 01

## Question

A copy de `src/sections/ScoreLab.tsx`, `src/sections/Weights.tsx` e `src/sections/Adjustments.tsx` passa a vir do dicionário?

Cobre títulos, ledes, textos de ajuda, rótulos das ações do laboratório de score, rótulos e legendas do gráfico de pesos e os cards de ajuste. Os nomes de ação que espelham a UI do X (like, reply, repost, quote, share, copy link, follow, mute, block, report) entram no dicionário como chaves, mesmo que o valor em pt-BR permaneça o termo em inglês — a decisão de traduzir ou glosar cada um é do ticket 05.

Critério: nenhum literal visível resta nesses três arquivos; build e lint passam; a versão em inglês não muda.
