# Extrair a copy de DemoFeed, ActionEffects e WeightLab

Type: task
Status:
Blocked by: 01

## Question

A copy de `src/sections/DemoFeed.tsx` (feed anotado + `ActionEffects`) e `src/sections/WeightLab.tsx` passa a vir do dicionário?

Cobre títulos e ledes, as razões de rank anotadas em cada post do feed simulado, os textos de efeito de cada botão de ação, os rótulos dos sliders, os nomes e descrições dos presets, os estados do fluxo de nomeação pelo Grok (botão, carregando, erro, resultado) e quaisquer mensagens de erro exibidas ao visitante.

O texto dos posts reais (`src/data/tweets.json`) fica em inglês e não entra no dicionário.

Critério: nenhum literal visível resta nesses arquivos; build e lint passam; a versão em inglês não muda.
