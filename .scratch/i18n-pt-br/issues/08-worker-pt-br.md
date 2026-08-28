# Worker em pt-BR: labels e prompt do Grok

Type: task
Status: resolved
Blocked by: 01

## Question

Como `POST /api/name` produz um nome de algoritmo em português quando o visitante está em pt-BR?

Entrega: o client envia o idioma ativo na requisição; o Worker valida esse campo contra a lista fechada de idiomas (rejeitando o resto, como já faz com os pesos), escolhe o mapa de `LABELS` correspondente e ajusta as mensagens de sistema e de usuário do Grok para pedir o nome no idioma pedido; as mensagens de erro devolvidas (`rate limited`, `invalid weight`, upstream) seguem legíveis para o client, que as apresenta pelo dicionário e não pelo texto cru do Worker.

Critério: requisições sem o campo de idioma continuam funcionando em inglês (compatibilidade); build e lint passam.

## Answer

`POST /api/name` aceita `locale` e devolve nome no idioma pedido.

- O client manda o locale ativo junto com os pesos. Campo ausente = `en`, então requisições antigas seguem funcionando; valor fora de `['en', 'pt-BR']` é `400 invalid locale`, igual ao tratamento dos pesos.
- O Worker tem um mapa de `LABELS` por idioma (o pt-BR descreve os pesos como `curtir`, `denunciar`, ...) e pede o nome explicitamente em `Brazilian Portuguese` na mensagem de sistema.
- As mensagens de erro do Worker seguem em inglês e são para diagnóstico: o client não as exibe — ele mantém o nome anterior em caso de falha e usa o próprio dicionário para o estado de espera.
