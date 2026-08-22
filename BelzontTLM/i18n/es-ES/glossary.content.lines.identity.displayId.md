---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
El **identificador de visualización**, también llamado acrónimo de línea o identificador de ruta en algunos controles, es un texto opcional que se muestra en lugar del número de ruta interna.

Seleccione el identificador en una tarjeta de listado de XTM para editar el acrónimo y el número interno juntos. El acrónimo también se puede editar en la sección **Datos de línea** de la ruta seleccionada. Bórrelo para devolver los nombres generados y los escudos XTM al número interno.

![Editor de identificadores abierto en una tarjeta de línea, con los campos de acrónimo y número interno](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Prioridad

Un nombre de ruta personalizado permanece independiente y no es reemplazado por el identificador. Cuando el juego genera un nombre de ruta, se utiliza un identificador no vacío como token numérico; de lo contrario se utiliza el número interno.

XTM utiliza la misma regla de identificador primero para escudos en el mapa lineal, informes de ocupación, grupos de tarifas, grupos de modelos de vehículos y detalles de segmentos. El listado lo muestra junto al escudo de transporte. La selección automática de colores y la clasificación numérica aún utilizan el número de ruta interna.

Mantenga los identificadores breves. El texto del escudo se reduce para ajustarse y el valor almacenado tiene un pequeño límite de bytes UTF-8.
