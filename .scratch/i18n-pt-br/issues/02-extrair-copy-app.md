# Extrair a copy de App.tsx para o dicionário en

Type: task
Status: resolved
Blocked by: 01

## Question

Toda a copy de `src/App.tsx` passa a vir do dicionário, sem mudança visual em inglês?

Cobre: `Nav` (rótulos e brand), `Hero` (título, lede, os dois boxlinks), os slides do deep dive definidos neste arquivo — `Fresh`, `Sources`, `Signals`, `Predictions`, `Visibility`, `Takeaways` — incluindo os arrays de células, rótulos de barras, listas de ações e cards, os rótulos das abas do slideshow (`SLIDES`), o "Next up"/"Back to the start" e o `Footer` (links e nota de rodapé sobre o snapshot do algoritmo).

Critério: nenhum literal de texto visível resta no JSX de `App.tsx`; `npm run build` e `npm run lint` passam; a página em `/` está idêntica à de antes.

Nota de estrutura: as partes do texto com ênfase (`<span className="dim">`) precisam de chaves separadas ou de um formato que preserve a quebra — decidir aqui e seguir o mesmo padrão nos tickets 03 e 04.

## Answer

Toda a copy visível de `src/App.tsx` vem do dicionário.

- **Padrão de ênfase**: cada título virou duas chaves, `title` + `titleDim` (o que estava no `<span className="dim">`). Simples, sem parser de marcação, e o mesmo padrão foi seguido nos tickets 03 e 04.
- Listas (`Fresh.stats`, `Signals.items`, `Visibility.rows`, `Takeaways.items`) são arrays de objetos no dicionário; o JSX só itera. Como os textos mudam de tamanho entre idiomas, `Visibility` decide o card destacado pela posição (último item), não mais comparando o texto com `'Drop'`.
- `Predictions` separou os números (`PREDICTION_ODDS`, no código) dos rótulos (no dicionário), então traduzir não duplica os valores.
- As abas do slideshow usam chaves estáveis: `SLIDES` é `[keyof Copy['deepDive']['slides'], ComponentType][]`, e "Next up"/"Back to the start" saem de `copy.deepDive`.
- `Signals` traz as frases completas no dicionário (o inglês prefixava "you" no JSX), porque em pt-BR a ordem da frase muda.
- Números formatados pelo locale (`Sources`, contagens) usam `toLocaleString(locale)`.
