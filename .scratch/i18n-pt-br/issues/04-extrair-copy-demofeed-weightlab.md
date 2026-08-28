# Extrair a copy de DemoFeed, ActionEffects e WeightLab

Type: task
Status: resolved
Blocked by: 01

## Question

A copy de `src/sections/DemoFeed.tsx` (feed anotado + `ActionEffects`) e `src/sections/WeightLab.tsx` passa a vir do dicionário?

Cobre títulos e ledes, as razões de rank anotadas em cada post do feed simulado, os textos de efeito de cada botão de ação, os rótulos dos sliders, os nomes e descrições dos presets, os estados do fluxo de nomeação pelo Grok (botão, carregando, erro, resultado) e quaisquer mensagens de erro exibidas ao visitante.

O texto dos posts reais (`src/data/tweets.json`) fica em inglês e não entra no dicionário.

Critério: nenhum literal visível resta nesses arquivos; build e lint passam; a versão em inglês não muda.

## Answer

Feed anotado, `ActionEffects` e `WeightLab` leem tudo do dicionário.

- Os quatro posts do feed anotado ficaram com id estável (`sara`, `priya`, `octo`, `sara2`); corpo e razões de rank vêm de `copy.demoFeed.posts[id]`, e o código só mantém os dados estruturais (nome, handle, hora, cor, stats) e o tipo de cada nota (`good`/`bad`/`info`).
- `ActionEffects`: rótulos curtos das ações em `copy.actionEffects.shortActions`; os tópicos classificados por regex passaram a ser ids (`rust`, `ai`, `careers`, `systems`, `infra`, `webdev`, `hotTakes`) com rótulo traduzido; o resumo dinâmico usa funções no dicionário (`interests`, `muted(n)`, `reported`, `idle`), o que resolve a concordância de plural em pt-BR.
- As regex de classificação continuam casando o texto em inglês dos posts reais — é lógica, não copy.
- `WeightLab`: `WEIGHT_DEFS` usa as chaves de `copy.actions`; os seis posts e os três presets têm ids (`friend`/`thread`/`dog`/`news`/`ragebait`/`spam`, `factory`/`rage`/`zen`) com título, trait, nome e descrição no dicionário; os estados do fluxo de nomeação (`naming`, `wait(s)`, `askGrok`, nome padrão) também.
- O nome padrão do algoritmo é derivado do locale (estado `name: string | null`), então trocar de idioma sem ter pedido nome ao Grok troca o texto exibido.
- O texto dos posts reais de `src/data/tweets.json` não entrou no dicionário (inclusive o post de fallback, que é conteúdo de post).
