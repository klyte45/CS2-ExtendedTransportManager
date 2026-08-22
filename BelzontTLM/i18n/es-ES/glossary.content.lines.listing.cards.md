---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identidad y apariencia

La franja diagonal de color muestra el **identificador de visualización** de la ruta. Un acrónimo que no esté vacío tiene prioridad; de lo contrario, se muestra el número de ruta interna. Seleccione el identificador para editar ambos valores.

![Tarjeta de línea con la franja identificadora, escudo, nombre, tipo, estadísticas y franja horaria](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

El pequeño escudo debajo muestra el ícono de transporte. Su forma sigue el modo de transporte, las rutas de carga reciben una insignia de carga y el servicio diurno, nocturno o para discapacitados recibe una insignia estatal de color.

Seleccione el escudo para abrir el selector de color. La elección de un color crea una anulación de color fijo. Cuando la ruta tiene una paleta asignada y la tarjeta reconoce una anulación fija, **Restaurar color de paleta** devuelve el control al color automático.

Seleccione el nombre de la ruta para cambiarle el nombre en su lugar. Al salir del editor se confirma un nombre modificado que no está vacío; Escape cancela la edición.

![Controles de edición de tarjetas con el editor de identificadores, el campo de nombre y el selector de color](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Tipo y detalles

Debajo del nombre, la tarjeta identifica la línea de pasajeros localizada o el tipo de ruta de carga. Seleccione **Detalles** para enfocar esa ruta y abrir su Panel de información seleccionada.

## Longitud, demanda y vehículos

Una tarjeta habilitada muestra la longitud de la ruta seguida de su estadística mensual de pasajeros o carga. Los valores de los pasajeros tienen el formato de recuento con la etiqueta de pasajero del modo. Los valores de carga tienen el formato de peso localizado.

La siguiente fila muestra la cantidad de vehículos de ruta activos y un rango de ocupación histórico. El rango es la ocupación efectiva mínima y máxima encontrada en las paradas de la ruta y en seis períodos de tiempo de cuatro horas. Se ignoran los depósitos más antiguos que ayer.

El rango utiliza porcentajes de un decimal. Su color de fondo sigue el valor máximo, lo que hace que las rutas muy ocupadas sean más fáciles de detectar. Una ruta nueva o una ruta sin historial utilizable puede mostrar **0.0%~0.0%**.

Las tarjetas deshabilitadas aún muestran la longitud de la ruta, pero ocultan las estadísticas de pasajeros o carga y reemplazan los datos del vehículo y la ocupación con **Línea deshabilitada**.

## Controles de servicio

La franja a lo largo de la parte inferior cambia la ruta directamente entre Día y noche, Sólo día, Sólo noche y Discapacitado. El botón resaltado es el estado actual. Cambiar estos controles también actualiza qué filtro de estado de servicio incluye la tarjeta.
