# Núcleo de i18n: contexto, dicionários tipados e resolução de idioma

Type: task
Status:
Blocked by: —

## Question

Como o app passa a saber em que idioma está e a entregar strings desse idioma, de forma que acrescentar um idioma seja acrescentar um arquivo?

Entrega:

- `src/i18n/en.ts` com o objeto `en` (inicialmente vazio ou com as chaves do chrome do app: nav e footer), `src/i18n/pt-BR.ts` tipado como `typeof en`, e `src/i18n/index.ts` exportando o mapa de locales, o tipo `Locale` e o dicionário resolvido.
- Contexto React (`LocaleProvider` + hook `useCopy`/`useLocale`) montado em `src/main.tsx`.
- Resolução de idioma pelo path: `/` → `en`, `/pt-br` → `pt-BR`; qualquer outro path desconhecido cai em `en`.
- Persistência da escolha explícita em `localStorage` (vence a detecção) e, na primeira visita sem preferência, redirecionamento para `/pt-br` quando `navigator.language` começar com `pt`.
- Alternador de idioma na barra de navegação, que navega para o path do idioma e grava a preferência.
- Âncoras de seção (`#scoring`, `#feed`, `#playground`, `#deepdive`) continuam funcionando em ambos os paths.

Fica fora deste ticket: extrair a copy das seções (tickets 02–04) e os metadados de SEO (ticket 07).
