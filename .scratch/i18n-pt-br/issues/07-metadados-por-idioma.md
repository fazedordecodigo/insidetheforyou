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
- **As URLs absolutas vêm de `window.location.origin`**, não de um domínio fixo no código. O repositório
  não declara o domínio de produção em lugar nenhum (nem no `wrangler.jsonc`, nem no README), e chutar
  um domínio produziria `canonical` e `hreflang` apontando para fora. O preço é que essas tags só
  existem depois do JS rodar.

O `index.html` mantém título e description em inglês e ganha as tags Open Graph estáticas
(`og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `twitter:card`) como linha de
base para quem não executa JS. `hreflang` e `canonical` ficam fora do HTML estático por dependerem
do origin.

Limite conhecido, herdado do mapa: sendo SPA, um crawler que não executa JS vê sempre a versão em
inglês em `/pt-br`. Resolver isso exige pré-render por idioma, explicitamente fora de escopo.
