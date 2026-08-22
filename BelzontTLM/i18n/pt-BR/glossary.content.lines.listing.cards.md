---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identidade e aparência

A faixa diagonal colorida mostra o **identificador de exibição** da rota. Uma sigla não vazia tem prioridade; caso contrário, o número da rota interna será mostrado. Selecione o identificador para editar ambos os valores.

![Cartão de linha com faixa identificadora, escudo, nome, tipo, estatísticas e faixa de programação](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

O pequeno escudo abaixo mostra o ícone de transporte. Seu formato segue o modo de transporte, as rotas de carga recebem uma insígnia de carga e os serviços diurnos, noturnos ou desativados recebem uma insígnia estadual colorida.

Selecione o escudo para abrir o seletor de cores. A escolha de uma cor cria uma substituição de cor fixa. Quando a rota tem uma paleta atribuída e o cartão reconhece uma substituição fixa, **Restaurar cor da paleta** retorna o controle para coloração automática.

Selecione o nome da rota para renomeá-la. Sair do editor confirma um nome alterado e não vazio; Escape cancela a edição.

![Controles de edição de cartão com editor de identificador, campo de nome e seletor de cores](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Tipo e detalhes

Abaixo do nome, o cartão identifica a linha de passageiros localizada ou o tipo de rota de carga. Selecione **Detalhes** para focar nessa rota e abrir o painel de informações selecionadas.

## Comprimento, demanda e veículos

Um cartão habilitado mostra a extensão da rota seguida pela estatística mensal de passageiros ou carga. Os valores dos passageiros são formatados como uma contagem com a etiqueta do passageiro do modo. Os valores de carga são formatados como peso localizado.

A próxima linha mostra o número de veículos da rota ativa e uma faixa histórica de ocupação. O intervalo é a ocupação efetiva mínima e máxima encontrada nas paradas da rota e seis períodos de quatro horas. Buckets anteriores a ontem são ignorados.

O intervalo usa porcentagens de uma casa decimal. Sua cor de fundo segue o valor máximo, facilitando a localização de rotas muito ocupadas. Uma nova rota ou uma rota sem histórico utilizável pode mostrar **0,0%~0,0%**.

Os cartões desativados ainda mostram o comprimento da rota, mas ocultam as estatísticas de passageiros ou carga e substituem os dados do veículo e de ocupação por **Linha desativada**.

## Controles de serviço

A faixa na parte inferior altera a rota diretamente entre Dia e noite, Somente dia, Somente noite e Desativado. O botão destacado é o estado atual. A alteração desses controles também atualiza qual filtro de estado de serviço inclui a placa.
