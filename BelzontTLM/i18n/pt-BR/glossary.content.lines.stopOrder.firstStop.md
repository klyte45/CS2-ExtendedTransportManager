---
key: K45::XTM.vuio[glossary.content.lines.stopOrder.firstStop]
---
Selecione uma parada no mapa linear do XTM e use o botão **1** em **Dados de parada** para torná-la a primeira parada do trajeto. O botão fica desabilitado para a parada que já é a primeira.

O XTM gira a ordem de parada da rota sem reverter sua direção. A parada escolhida torna-se o topo do mapa linear completo e o terminal inicial usado pela visualização simétrica de meia viagem.

Alterar a primeira parada também altera os índices de parada e os limites cegos de destino do Write Everywhere. O texto de destino configurado para usar o final da linha é resolvido para a nova primeira parada.

Uma rota simétrica pode deixar de se qualificar para a modalidade meia viagem se você escolher uma plataforma intermediária. A escolha do terminal oposto normalmente preserva o emparelhamento de ida e volta enquanto as duas extremidades são trocadas.

![Não primeira parada selecionada com dados de parada mostrando as ações 1 e seta circular](coui://xtm.k45/UI/images/xtm-sip-first-stop.jpg)
