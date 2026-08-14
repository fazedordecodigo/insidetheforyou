# Documentar como acrescentar um idioma

Type: task
Status: resolved
Blocked by: 06

## Question

O README explica a arquitetura de i18n de forma que outra pessoa acrescente um idioma sem ler o código?

Entrega: seção no `README.md` cobrindo onde vivem os dicionários, como o idioma é resolvido pelo path e pela preferência salva, o passo a passo para acrescentar um idioma (criar `src/i18n/<locale>.ts`, registrar no mapa de locales, acrescentar hreflang e o mapa de labels do Worker) e o que deliberadamente não é traduzido (posts de exemplo e os termos do glossário). A tabela de estrutura do projeto no README ganha as novas entradas.

## Answer

Sim. O `README.md` ganhou a seção "Languages", em inglês como o resto do arquivo, com quatro partes:

- **Arquitetura**: dicionários tipados em `src/i18n/`, `en` como fonte da forma via
  `type Copy = typeof en`, e o fato de `npm run build` falhar em chave faltante ou sobrando — a
  garantia de paridade é o compilador, não uma checagem manual.
- **Resolução do idioma**, na ordem: path, preferência salva em `insidetheforyou.locale`,
  `navigator.languages`. Com a nota de por que a URL sempre acaba nomeando o idioma renderizado
  (`replaceState` na primeira resolução, `pushState` na troca explícita).
- **"Add a language"**, em três passos: criar `src/i18n/<locale>.ts` declarado como `Copy`, registrar o
  locale nos seis mapas de `locale.ts` (`LOCALES`, `LOCALE_PATHS`, `LOCALE_LABELS`, `LOCALE_NAMES`,
  `LOCALE_OG_TAGS`, `DICTIONARIES`) mais o prefixo em `detectLocale`, e acrescentar o idioma em
  `worker/index.ts`. Fica explícito o que **não** precisa mudar: alternador, `hreflang`, metadados e
  formatação de números iteram sobre `LOCALES`, e o path novo já funciona por causa do
  `not_found_handling: single-page-application`.
- **"What stays untranslated on purpose"**: posts reais, rótulos de ação seguindo o app do X, nomes de
  sistema e jargão glosado, e a regra de nunca formatar número à mão (usar `useFormat()`).

A tabela de estrutura do projeto ganhou sete linhas: os seis arquivos de `src/i18n/` e o
`LanguageSwitcher`.
