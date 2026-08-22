---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
**El tiempo esperado de ida y vuelta** en **Estadísticas avanzadas** estima cuántos minutos de juego necesita un vehículo para completar la ruta una vez.

XTM agrega la duración de la búsqueda de ruta de cada segmento de ruta que tiene datos de ruta, escala ese total con un factor de estimación fijo y agrega una pequeña asignación fija por parada. El resultado se convierte en minutos de juego utilizando la duración del día de la ciudad.

Esta es una estimación de planificación a partir de datos de ruta, no una medición de las vueltas reales del vehículo. Los segmentos sin datos de ruta se omiten, por lo que las rutas incompletas pueden subestimar el resultado. Empareje el valor con el recuento de vehículos al razonar sobre los avances; el panel no calcula el avance por usted.

![Estadísticas avanzadas de datos de línea con tiempo de ida y vuelta esperado visible](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
