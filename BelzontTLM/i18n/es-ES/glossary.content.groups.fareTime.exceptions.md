---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Utilice **Excepciones horarias** cuando una tarifa deba diferir de la predeterminada durante parte del día. **Agregar excepción** crea un rango de una hora en la primera hora descubierta y copia la tarifa predeterminada redondeada.

Establezca inicio, fin y tarifa. El horario va del 0 al 23 y ambos puntos finales están incluidos: del 7 al 9 se aplica de 07:00 a 09:59.

El inicio no puede ser posterior al final y los rangos no pueden abarcar toda la medianoche. Utilice dos excepciones para un período nocturno. Las excepciones no pueden superponerse; Debido a que los puntos finales son inclusivos, los rangos que comparten una hora también entran en conflicto.

XTM admite como máximo 20 excepciones. Los rangos no válidos muestran una advertencia y bloquean todos los cambios del grupo actual para que no se guarden hasta que se solucionen o eliminen.

Establece una tarifa de excepción en **0** para viajar gratis durante ese rango.

![Excepciones horarias con rangos gratuitos y pagos](coui://xtm.k45/UI/images/xtm-fare-group-hour-exceptions.jpg)
