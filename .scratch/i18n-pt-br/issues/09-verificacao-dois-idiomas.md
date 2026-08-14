# Verificação end-to-end das duas versões

Type: task
Status:
Blocked by: 06, 07, 08

## Question

As duas versões funcionam de fato, no navegador?

Cobre: `npm run lint` e `npm run build` limpos; percorrer `/` e `/pt-br` no navegador conferindo cada seção interativa (laboratório de score, feed anotado, efeitos de ação, playground de pesos com o nome gerado pelo Grok, slideshow completo); trocar de idioma no alternador e confirmar que a preferência persiste após recarregar; conferir o auto-redirect com `navigator.language` em pt; procurar layout quebrado por texto mais longo em português; gravar a passagem como evidência.
