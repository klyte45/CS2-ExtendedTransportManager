---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
O XTM registra a ocupação histórica quando um veículo de passageiros ou carga termina o embarque e começa a viajar em direção à sua próxima parada. A amostra pertence ao segmento direcionado que começa na parada de partida.

Cada segmento tem seis períodos: **00h00–04h00**, **04h00–08h00**, **08h00–12h00**, **12h00–16h00**, **16h00–20h00** e **20h00–24h00**. **Hora atual** seleciona o período que contém a hora atual da simulação. **Média diária** é a média simples de períodos não obsoletos.

## Suavização com polarização de pico

Uma amostra acima do valor armazenado o substitui imediatamente. Uma amostra inferior combina 70% do valor anterior com 30% da nova amostra. A capacidade segue a mesma regra. Isto expõe rapidamente aglomerações repentinas, enquanto partidas repetidas e mais silenciosas reduzem gradualmente o histórico.

Um período torna-se obsoleto quando sua última amostra é mais antiga que ontem. Os períodos obsoletos aparecem como lacunas no gráfico e são excluídos das médias, intervalos de listagem e classificações. Os valores de mapa ausentes ou obsoletos aparecem atualmente como 0%.

![Histórico de ocupação do segmento com seis períodos de quatro horas e a média diária não obsoleta](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
