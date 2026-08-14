# Escrever a tradução pt-BR completa

Type: task
Status:
Blocked by: 05

## Question

`src/i18n/pt-BR.ts` cobre todas as chaves com tradução que respeita o tom decidido e o glossário?

Regras: "você", informal e direto, frases curtas espelhando o ritmo do inglês, sem gerundismo, sem tradução literal; glossário do ticket 05 aplicado de forma consistente, com glosa apenas na primeira ocorrência de cada termo; números e percentuais formatados para pt-BR onde o texto os apresenta.

Critério: o compilador não acusa nenhuma chave faltante ou extra em relação a `en`; `/pt-br` renderiza a página inteira em português, sem nenhum resquício em inglês fora dos termos do glossário; nenhum layout quebra por texto mais longo (o português cresce ~20%).
