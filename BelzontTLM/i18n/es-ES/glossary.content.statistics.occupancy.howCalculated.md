---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM registra la ocupación histórica cuando un vehículo de pasajeros o de carga termina de abordar y comienza a viajar hacia su siguiente parada. La muestra pertenece al segmento dirigido que comienza en la parada de salida.

Cada segmento tiene seis períodos: **00:00–04:00**, **04:00–08:00**, **08:00–12:00**, **12:00–16:00**, **16:00–20:00** y **20:00–24:00**. **Hora actual** selecciona el período que contiene la hora de simulación actual. **Promedio diario** es la media simple de períodos no obsoletos.

## Suavizado sesgado por picos

Una muestra por encima del valor almacenado lo reemplaza inmediatamente. Una muestra inferior combina el 70% del valor anterior con el 30% de la nueva muestra. La capacidad sigue la misma regla. Esto expone rápidamente una aglomeración repentina, mientras que las repetidas salidas más silenciosas reducen la historia gradualmente.

Un período se vuelve obsoleto cuando su última muestra es más antigua que ayer. Los períodos obsoletos aparecen como espacios en el gráfico y se excluyen de los promedios, rangos de listado y clasificaciones. Los valores de mapas faltantes o obsoletos aparecen actualmente como 0%.

![Historial de ocupación del segmento con seis períodos de cuatro horas y el promedio diario no obsoleto](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
