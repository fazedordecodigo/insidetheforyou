# Verificação end-to-end das duas versões

Type: task
Status: resolved
Blocked by: 06, 07, 08

## Question

As duas versões funcionam de fato, no navegador?

Cobre: `npm run lint` e `npm run build` limpos; percorrer `/` e `/pt-br` no navegador conferindo cada seção interativa (laboratório de score, feed anotado, efeitos de ação, playground de pesos com o nome gerado pelo Grok, slideshow completo); trocar de idioma no alternador e confirmar que a preferência persiste após recarregar; conferir o auto-redirect com `navigator.language` em pt; procurar layout quebrado por texto mais longo em português; gravar a passagem como evidência.

## Answer

Sim, e a verificação foi feita no **build de produção** (`npm run build` + `npm run preview`, servindo
`dist/` em `http://localhost:4173`), não no dev server — as passagens dos tickets 01–07 rodaram no Vite
dev, e este ticket cobre o que vai ao ar.

Verde em: render completo de `/` e `/pt-br` sem string vazia, `undefined` ou `[object`; ScoreLab, feed
anotado, ActionEffects, WeightLab e as oito abas do Deep Dive nos dois idiomas; decimais com ponto em
inglês e vírgula em pt-BR; layout de 375px sem rolagem horizontal involuntária; console sem nenhuma
exceção de JS do bundle minificado.

Os dois casos que só este ticket cobriu, porque exigem recarregamento real:

- **Persistência**: escolher PT, dar F5, continuar em pt-BR; trocar para EN, dar F5, continuar em inglês.
- **Precedência completa**: com `localStorage` limpo, um Chrome com `--lang=pt-BR --accept-lang=pt-BR,pt`
  carregando `/` é redirecionado para `/pt-br`; um navegador `en-US` permanece em `/`; e o mesmo
  navegador pt-BR com `insidetheforyou.locale = 'en'` salvo fica em inglês — a preferência salva vence
  `navigator.languages`, como o mapa exige.

Achado lateral: `npm run preview` responde `/pt-br` com HTTP 200, então as URLs de locale carregam
direto no preview.

Fora do que esta verificação prova, por falta de ambiente:

- `POST /api/name` (o "Perguntar ao Grok"): rota do Worker, exige `XAI_API_KEY`. Só foi confirmado que o
  botão aparece nos dois idiomas.
- O fallback de SPA do Worker Cloudflare em `/pt-br` no site publicado. O preview do Vite serve esse
  path por conta própria, o que não diz nada sobre a config do Cloudflare; provar isso exige
  `wrangler dev` ou um deploy.
