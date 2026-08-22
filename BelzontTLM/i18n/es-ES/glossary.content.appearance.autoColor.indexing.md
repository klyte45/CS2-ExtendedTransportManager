---
key: K45::XTM.vuio[glossary.content.appearance.autoColor.indexing]
---
Para una asignación válida que no esté vacía, XTM selecciona un color de paleta del **número de ruta interna**. La ruta 1 usa el primer color, la ruta 2 el segundo y la secuencia termina después del último color.

La ruta 0 pasa al color final y los números de ruta negativos continúan hacia atrás en la secuencia. El identificador, el acrónimo y el nombre mostrados no afectan la indexación.

Cambiar el número interno puede cambiar el color de la ruta. Editar o reordenar una paleta cambia el color representado por cada posición.

Una ruta con **Usar color fijo** ignora los cambios de asignación, número y paleta hasta que se elimine la anulación. Si una asignación está deshabilitada, falta o está vacía, regresar al control de la paleta puede dejar el color actual sin cambios.

![Posiciones de la paleta coinciden con los números de ruta](coui://xtm.k45/UI/images/xtm-palette-indexing.jpg)
