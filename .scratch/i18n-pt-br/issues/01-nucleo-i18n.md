# Núcleo de i18n: contexto, dicionários tipados e resolução de idioma

Type: task
Status: resolved
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

## Answer

O núcleo existe e o site já responde nos dois paths.

- `src/i18n/en.ts` guarda o objeto `en` (chrome do app: nav e footer) e exporta `type Copy = typeof en`; `src/i18n/pt-BR.ts` declara `export const ptBR: Copy`, então chave faltante ou sobrando é erro de compilação — sem lint extra e sem teste de paridade.
- `src/i18n/locale.ts` concentra a resolução: `LOCALES`, `LOCALE_PATHS` (`en: '/'`, `pt-BR: '/pt-br'`), rótulos, leitura/escrita de `localStorage` (chave `insidetheforyou.locale`, com try/catch para storage bloqueado), `detectLocale()` sobre `navigator.languages` e `resolveInitialLocale()`.
- **Precedência decidida na implementação**: o path só é autoritativo quando *nomeia* um idioma (`/pt-br`); `/` é ambíguo, então cede para a preferência salva e depois para o navegador. Assim a preferência explícita vence a detecção sem quebrar links diretos para `/pt-br`, e o visitante pt-BR que abre `/` cai em português.
- O redirecionamento da primeira visita é `history.replaceState` no `LocaleProvider`, não navegação: sem recarregar a página e sem flash de conteúdo em inglês. A troca no alternador usa `pushState`, então o botão voltar do navegador desfaz a troca (há listener de `popstate`).
- Cada entrada de histórico carrega o próprio idioma: no `popstate` o idioma vem só do path (`/` → `en`), sem consultar a preferência salva. O teste end-to-end pegou exatamente isso — voltar para `/` mantinha a UI em português porque a preferência já era `pt-BR`. Consequência aceita: recarregar `/` depois disso devolve português, porque em carga inicial a preferência ainda vence o path ambíguo.
- `urlForLocale` preserva query string e hash, então trocar de idioma no meio da página mantém a âncora. As âncoras de seção seguem relativas (`#scoring`), logo funcionam igual em `/` e `/pt-br`.
- `LanguageSwitcher` (EN | PT) entrou na barra de navegação, com estilos `.lang-switch`/`.lang-option` em `src/index.css`, inclusive o ajuste do breakpoint de 700px.
- `wrangler.jsonc` ganhou `assets.not_found_handling: "single-page-application"`: sem isso o Worker devolveria 404 em `/pt-br`, já que não existe arquivo nesse path. Em desenvolvimento, o fallback de SPA do Vite já cobre.

`npm run lint` e `npm run build` limpos.
