# Documentar como acrescentar um idioma

Type: task
Status:
Blocked by: 06

## Question

O README explica a arquitetura de i18n de forma que outra pessoa acrescente um idioma sem ler o código?

Entrega: seção no `README.md` cobrindo onde vivem os dicionários, como o idioma é resolvido pelo path e pela preferência salva, o passo a passo para acrescentar um idioma (criar `src/i18n/<locale>.ts`, registrar no mapa de locales, acrescentar hreflang e o mapa de labels do Worker) e o que deliberadamente não é traduzido (posts de exemplo e os termos do glossário). A tabela de estrutura do projeto no README ganha as novas entradas.
