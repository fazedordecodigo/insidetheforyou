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
- **"Add a language"**, em quatro passos: criar `src/i18n/<locale>.ts` declarado como `Copy`; registrar
  o locale nos mapas sem DOM de `shared/locales.ts` (`LOCALES`, `LOCALE_PATHS`, `LOCALE_OG_TAGS`), de
  onde o app, o Worker e o build leem; registrar o resto no app (`LOCALE_LABELS`, `LOCALE_NAMES` e o
  prefixo em `detectLocale`, em `locale.ts`, mais `DICTIONARIES` em `dictionaries.ts`); e acrescentar
  `LANGUAGES`/`LABELS` em `shared/name-prompt.ts`, que é onde as tabelas de idioma do `/api/name`
  passaram a morar — o Worker e o emulador de dev importam esse módulo. Fica explícito o que **não**
  precisa mudar: alternador, `hreflang`, metadados, formatação de números e o HTML por idioma iteram
  sobre `LOCALES`.
- **"What stays untranslated on purpose"**: posts reais, rótulos de ação seguindo o app do X, nomes de
  sistema e jargão glosado, e a regra de nunca formatar número à mão (usar `useFormat()`).

A tabela de estrutura do projeto ganhou sete linhas: os seis arquivos de `src/i18n/` e o
`LanguageSwitcher`.
