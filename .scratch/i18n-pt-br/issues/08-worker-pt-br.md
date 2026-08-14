# Worker em pt-BR: labels e prompt do Grok

Type: task
Status:
Blocked by: 01

## Question

Como `POST /api/name` produz um nome de algoritmo em português quando o visitante está em pt-BR?

Entrega: o client envia o idioma ativo na requisição; o Worker valida esse campo contra a lista fechada de idiomas (rejeitando o resto, como já faz com os pesos), escolhe o mapa de `LABELS` correspondente e ajusta as mensagens de sistema e de usuário do Grok para pedir o nome no idioma pedido; as mensagens de erro devolvidas (`rate limited`, `invalid weight`, upstream) seguem legíveis para o client, que as apresenta pelo dicionário e não pelo texto cru do Worker.

Critério: requisições sem o campo de idioma continuam funcionando em inglês (compatibilidade); build e lint passam.
