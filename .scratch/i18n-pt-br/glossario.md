# Glossário pt-BR

Tabela fechada de `termo → tratamento em pt-BR`. O ticket 06 aplica esta tabela sem reabrir a
discussão. Tratamentos possíveis:

- **PT oficial** — usar o rótulo que o próprio X usa na interface em português do Brasil.
- **EN + glosa** — manter em inglês e explicar em português na primeira ocorrência.
- **EN puro** — manter em inglês, sem glosa (o termo já é o nome próprio de um sistema).
- **PT** — traduzir livremente (termo autoral desta página, não do X).

## 1. Ações do usuário (rótulos de UI do X)

Estes são os `copy.actions` e `copy.actionEffects.shortActions`. Todos seguem **PT oficial**, ou
seja, o texto que aparece no app do X em pt-BR — o leitor tem que reconhecer o botão que ele
aperta todo dia.

| Termo (EN) | pt-BR | Nota |
| --- | --- | --- |
| Like | Curtir | rótulo do X |
| Reply | Responder | rótulo do X |
| Reply (mutual follow) | Responder (seguem um ao outro) | "mutual follow" não tem rótulo no X; descrito |
| Repost | Repostar | rótulo do X (não "retweetar", termo aposentado) |
| Quote | Citar | rótulo do X |
| Share | Compartilhar | rótulo do X |
| Share via DM | Enviar por DM | "DM" fica em EN: é o que o X usa em pt-BR |
| Copy the link | Copiar o link | rótulo do X |
| Follow the author | Seguir o autor | rótulo do X |
| Open the post | Abrir o post | "post" fica em EN (ver seção 4) |
| Watch the video | Assistir ao vídeo | — |
| "Not interested" | "Não tenho interesse" | rótulo do X, entre aspas como no original |
| Block the author | Bloquear o autor | rótulo do X |
| Mute the author | Silenciar o autor | rótulo do X |
| Report | Denunciar | rótulo do X (não "reportar") |

## 2. Nomes de sistemas do X — **EN puro**

Nomes próprios de componentes internos. Traduzir tornaria impossível achá-los no repositório
aberto. Onde aparecem, a frase ao redor já explica a função em português.

| Termo | Glosa em português na página |
| --- | --- |
| Home Mixer | "um sistema chamado Home Mixer junta posts candidatos, pontua e filtra tudo em menos de um segundo" |
| Thunder | "Thunder: quem você segue" / "entregue na hora pelo Thunder" |
| Phoenix | "Phoenix: descoberta por ML" / "achado pelo Phoenix" |
| SimClusters | "SimClusters: comunidades de gosto" |
| Grok | nome de produto, sem glosa |
| ThriftChannel, favScore e afins | não aparecem na copy atual; se entrarem, **EN + glosa** |

## 3. Vocabulário do algoritmo

| Termo (EN) | Tratamento | pt-BR |
| --- | --- | --- |
| ranker | **EN + glosa** | "ranker" após "modelo de ranqueamento" ter aparecido; é o substantivo curto reusado |
| ranking (o processo) | PT | "ranqueamento" / "ranqueado" |
| transformer | **EN + glosa** | "um modelo transformer (a mesma família de IA que roda nos chatbots)" |
| in-network | PT | "dentro da rede" |
| out-of-network | PT | "fora da rede" |
| out-of-network discount | PT | "desconto de fora da rede" |
| author diversity decay | PT | "decaimento por diversidade de autor" |
| new-author boost | PT | "impulso a autor novo" |
| dwell | **EN + glosa** | "o tempo parado em um post (o 'dwell')" |
| candidate | PT | "candidato" / "posts candidatos" |
| score | PT | "pontuação" (verbo: "pontuar") |
| weight | PT | "peso" |
| visibility filtering | PT | "checagem de visibilidade" |
| Allow / Interstitial / Drop | PT | "Liberar" / "Aviso" / "Descartar" |
| impressions | PT | "impressões" |

## 4. Termos que o brasileiro já usa em inglês — **EN puro**

Traduzir soaria artificial para o público desta página.

| Termo | Por quê |
| --- | --- |
| For You | nome da aba, idêntico no app em pt-BR |
| feed | usado em pt-BR corrente; "timeline" também fica em EN quando aparece |
| post | o X pt-BR usa "post"; "publicação" seria mais formal que o tom da página |
| thread | consagrado em pt-BR |
| DM | idem |
| ML | sigla mantida |
| webdev, infra, rust, SaaS, ETH | tópicos e jargão técnico |

## 5. Copy autoral desta página (não é vocabulário do X) — **PT**

Livre para soar bem em português; nada aqui precisa casar com o X.

| EN | pt-BR |
| --- | --- |
| Scoring / Feed / Playground / Deep dive (nav) | Pontuação / Feed / Laboratório / A fundo |
| Max aura / Negative aura | Aura máxima / Aura negativa |
| Reset | Zerar |
| Post score | Pontuação do post |
| Factory settings | Padrão de fábrica |
| Rage merchant | Mercador de raiva |
| Zen mode | Modo zen |
| ragebait | "isca de raiva" (e "Opinião polêmica feita para te irritar") |
| hot takes | "opiniões polêmicas" |
| bookmark bait | "isca de salvar" |
| The knobs | Os controles |
| Your feed, ranked | Seu feed, ranqueado |
| You built | Você criou |
| Just Regular X | X Comum Mesmo |
| Ask Grok | Perguntar ao Grok |
| Next up / Back to the start | A seguir / Voltar ao início |
| Built with Devin | Feito com Devin |

## 6. Convenções de forma

- Tratamento: **você**, informal e direto; nunca "tu" nem "vós".
- Frases curtas espelhando o ritmo do inglês; sem gerundismo ("vai aparecer", não "estará aparecendo").
- Números sempre pelo `useFormat()` — vírgula decimal e ponto de milhar em pt-BR (`+0,5`, `~3.000`, `31,0%`).
- Multiplicadores com vírgula: `×0,75`, `×1,0`.
- Aspas curvas (`“ ”`) como no original.
- Posts reais de `src/data/tweets.json` **nunca** são traduzidos: é conteúdo de terceiros.
