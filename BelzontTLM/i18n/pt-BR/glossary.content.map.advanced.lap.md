---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
**Tempo esperado de ida e volta** em **Estatísticas avançadas** estima quantos minutos de jogo um veículo precisa para completar a rota uma vez.

O XTM adiciona a duração do pathfinding de cada segmento de rota que possui dados de caminho, dimensiona esse total com um fator de estimativa fixo e adiciona uma pequena margem fixa por parada. O resultado é convertido em minutos de jogo usando a duração do dia da cidade.

Esta é uma estimativa de planejamento a partir de dados de trajeto, e não uma medição das voltas reais do veículo. Os segmentos sem dados de caminho são ignorados, portanto, rotas incompletas podem reportar o resultado de forma insuficiente. Combine o valor com a contagem de veículos ao raciocinar sobre progressos; o painel não calcula o progresso para você.

![Estatísticas avançadas de dados de linha com tempo de ida e volta esperado visível](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
