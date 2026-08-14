# Extrair a copy de App.tsx para o dicionário en

Type: task
Status:
Blocked by: 01

## Question

Toda a copy de `src/App.tsx` passa a vir do dicionário, sem mudança visual em inglês?

Cobre: `Nav` (rótulos e brand), `Hero` (título, lede, os dois boxlinks), os slides do deep dive definidos neste arquivo — `Fresh`, `Sources`, `Signals`, `Predictions`, `Visibility`, `Takeaways` — incluindo os arrays de células, rótulos de barras, listas de ações e cards, os rótulos das abas do slideshow (`SLIDES`), o "Next up"/"Back to the start" e o `Footer` (links e nota de rodapé sobre o snapshot do algoritmo).

Critério: nenhum literal de texto visível resta no JSX de `App.tsx`; `npm run build` e `npm run lint` passam; a página em `/` está idêntica à de antes.

Nota de estrutura: as partes do texto com ênfase (`<span className="dim">`) precisam de chaves separadas ou de um formato que preserve a quebra — decidir aqui e seguir o mesmo padrão nos tickets 03 e 04.
