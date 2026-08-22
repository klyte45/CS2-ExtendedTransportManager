---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
O **identificador de exibição**, também chamado de sigla de linha ou identificador de rota em alguns controles, é um texto opcional mostrado no lugar do número da rota interna.

Selecione o identificador em um cartão de listagem XTM para editar a sigla e o número interno juntos. A sigla também pode ser editada na seção **Dados da linha** da rota selecionada. Limpe-o para retornar nomes gerados e escudos XTM para o número interno.

![Editor de identificador aberto em uma placa de linha, com os campos de sigla e número interno](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Precedência

Um nome de rota personalizado permanece independente e não é substituído pelo identificador. Quando o jogo gera um nome de rota, um identificador não vazio é usado como token numérico; caso contrário, o número interno será usado.

O XTM usa a mesma regra do identificador primeiro para escudos no mapa linear, relatórios de ocupação, grupos de tarifas, grupos de modelos de veículos e detalhes de segmento. A listagem o exibe ao lado do escudo de transporte. A seleção automática de cores e a classificação numérica ainda usam o número da rota interna.

Mantenha os identificadores curtos. O texto protegido é reduzido para caber e o valor armazenado tem um pequeno limite de bytes UTF-8.
