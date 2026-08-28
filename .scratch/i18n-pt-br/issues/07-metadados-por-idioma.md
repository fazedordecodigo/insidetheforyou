# Metadados e SEO por idioma

Type: task
Status: resolved
Blocked by: 01

## Question

O que o navegador e os crawlers veem em cada idioma?

Entrega: `<html lang>` atualizado conforme o idioma ativo; `<title>` e `<meta name="description">` por idioma; tags `link rel="alternate" hreflang` para `en`, `pt-BR` e `x-default` no `index.html`; metadados Open Graph coerentes com o idioma, se já existirem ou se forem baratos de acrescentar.

Fora de escopo (registrado no mapa): pré-render/SSR por idioma. Os metadados são ajustados no client.

## Answer

`src/i18n/metadata.ts` concentra tudo em `applyMetadata(locale)`, chamada por um efeito do
`LocaleProvider` a cada mudança de idioma — a troca não recarrega a página, então os metadados têm
de acompanhar o re-render, não só o carregamento.

O que ela escreve: `<html lang>` (`en` / `pt-BR`), `document.title`, `description`, `og:title`,
`og:description`, `og:site_name`, `og:locale` (`en_US` / `pt_BR`), `og:url`, `twitter:title`,
`twitter:description`, `link rel=canonical` e os três `link rel=alternate hreflang` (`en`, `pt-BR`,
`x-default` → raiz).

Duas decisões que valem registro:

- **Os textos moram no dicionário**, em `copy.meta` (`title`, `description`, `siteName`). Assim um
  terceiro idioma continua sendo "um arquivo novo", sem tocar em `metadata.ts`, e o compilador cobra
  as chaves.
- **As URLs absolutas vinham de `window.location.origin`**, porque o repositório não declarava o
  domínio de produção em lugar nenhum (nem no `wrangler.jsonc`, nem no README) e chutar um domínio
  produziria `canonical` e `hreflang` apontando para fora.

A primeira entrega deixava o HTML estático em inglês (`index.html` com título, description e algumas
tags Open Graph fixas), e `hreflang`/`canonical` só existiam depois do JS rodar — o limite herdado do
mapa, de que um crawler sem JS veria sempre a versão inglesa em `/pt-br`.

## Emenda: baseline estático por idioma

O autor informou o domínio (`https://insidetheforyou.com`), e com ele o limite caiu sem pré-render nem
SSR. O domínio virou a constante `SITE_URL` em `shared/locales.ts` — derivá-lo do request faria o
`canonical` de um preview build apontar para o preview.

`index.html` não tem mais metadados escritos à mão, só o marcador `<!--locale-head-->`, e o plugin
`locale-html` (`vite.config.ts`) chama `replaceHead()` de `src/i18n/head.ts` para gerar o `<head>` de
cada idioma a partir dos dicionários, escrevendo um arquivo por idioma extra (`dist/pt-br.html`). O
head estático leva o conjunto completo: título, description, `canonical`, `og:url`, `og:image` (card
1200×630 em `public/og-card.png`, regerável com `npm run og:card`) e os três `hreflang` — estes com
`data-locale-alternate`, o mesmo marcador que `applyMetadata()` usa para limpar, para a troca no
cliente substituir o bloco em vez de duplicá-lo. Sem o marcador o build falha, em vez de emitir
páginas sem metadados.

O arquivo é `pt-br.html` e não `pt-br/index.html` porque o `html_handling: auto-trailing-slash` do
`wrangler.jsonc` redirecionaria `/pt-br` → `/pt-br/` na forma de pasta. Verificado com `wrangler dev`:
`/pt-br` responde 200 com `lang="pt-BR"`, enquanto `/pt-br.html` e `/pt-br/` respondem 307 para
`/pt-br`.

Fica de pé um limite menor: qualquer caminho sem arquivo (`/qualquer-coisa`) cai no
`not_found_handling: single-page-application` e é respondido com o `index.html` em inglês, logo com
`canonical` da raiz.
