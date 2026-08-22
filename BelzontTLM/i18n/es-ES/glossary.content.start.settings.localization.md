---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Traducciones integradas

XTM carga el inglés como idioma base para cada configuración regional de juego compatible. El paquete actual también contiene traducciones CSV al portugués (Brasil) y al coreano.

Cuando falta una clave traducida o está en blanco, se utiliza el valor CSV en inglés.

## archivos CSV

El **i18n.csv** principal contiene columnas de idioma. Un archivo de idioma separado, como **ko-KR.csv**, se utiliza solo cuando ese idioma no tiene ninguna columna en el archivo principal.

Los archivos CSV están separados por tabulaciones y requieren una fila de encabezado. Mantenga el formato de los marcadores de posición, como las llaves, sin cambios. Utilice las secuencias literales \n y \t cuando un valor CSV necesite un salto de línea o tabulación.

## Cuerpos del glosario de Markdown

Las entradas largas del glosario utilizan un archivo Markdown por clave en **i18n/en-US**. Otros idiomas pueden superponer entradas individuales en su propia carpeta de idioma. Un archivo Markdown traducido que falta conserva automáticamente el cuerpo en inglés.

Cada archivo Markdown requiere un frontmatter que contenga **key:** o **entry:** seguido de la clave de localización ensamblada.

Los cuerpos de Markdown se cargan después de las entradas CSV, por lo que un archivo Markdown anula un valor CSV con la misma clave.

## Probando traducciones

Utilice **Ir a la carpeta Traducciones** para abrir el directorio XTM i18n instalado. Después de editar un archivo, usa **Recargar traducciones** para eliminar y reconstruir todas las fuentes de localización de XTM sin reiniciar el juego.

![Página de opciones con la carpeta de traducciones y los botones de recarga junto a los accesos directos al foro, al repositorio y a la carpeta de registro](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Si el texto ya abierto no se actualiza visualmente, cierre y vuelva a abrir ese panel después de recargarlo.
