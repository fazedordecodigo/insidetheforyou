# Glossário pt-BR dos termos técnicos e de UI do X

Type: grilling
Status: resolved
Blocked by: 02, 03, 04

## Question

Para cada termo que o mapa decidiu manter em inglês, qual é a glosa em português e onde ela aparece?

Com o inventário de chaves já extraído (tickets 02–04), levantar a lista fechada de termos — termos de UI do X (like, repost, quote, For You, not interested, dwell), nomes de sistema (Home Mixer, Thunder, Phoenix, SimClusters, ThriftChannel), nomes de sinais e métricas (favScore, in-network, out-of-network, interstitial) — e decidir com o dono, um termo por vez, entre: manter em inglês com glosa na primeira ocorrência, manter sem glosa, ou traduzir.

Resolução: uma tabela `termo → tratamento em pt-BR` gravada em `.scratch/i18n-pt-br/glossario.md`, que o ticket 06 aplica sem reabrir a discussão.

## Answer

A tabela está em `.scratch/i18n-pt-br/glossario.md`, com cinco tratamentos: PT oficial, EN + glosa,
EN puro, PT e convenções de forma.

O dono reverteu uma decisão do mapa: os **rótulos de ação do X** (like, repost, quote, mute, report)
não ficam em inglês, e sim no rótulo oficial do X em pt-BR — Curtir, Repostar, Citar, Silenciar,
Denunciar, "Não tenho interesse". Motivo: o app do X em português já traduz esses botões, e manter
"Like"/"Repost" impediria o leitor de reconhecer o botão que ele aperta todo dia. "Repostar" (não
"retweetar") e "Denunciar" (não "reportar") seguem o app.

O resto do mapa continua valendo:

- Nomes de sistema ficam em **EN puro**, com a função explicada na frase ao redor: Home Mixer,
  Thunder, Phoenix, SimClusters, Grok.
- Jargão sem rótulo oficial fica em **EN + glosa**, glosado na primeira ocorrência: ranker,
  transformer, dwell.
- Vocabulário descritivo do algoritmo é traduzido: dentro/fora da rede, desconto de fora da rede,
  decaimento por diversidade de autor, impulso a autor novo, Liberar/Aviso/Descartar.
- Termos que o público já usa em inglês ficam intactos: For You, feed, post, thread, DM, ML.
- Copy autoral (nav, presets, aura, nomes de seção) é traduzida livremente.
