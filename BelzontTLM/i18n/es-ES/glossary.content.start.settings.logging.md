---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Niveles de registro

**Normal** registra información ordinaria, advertencias y errores y se recomienda para jugar con regularidad.

**Depurar** agrega mensajes de diagnóstico de las funciones de XTM. **Trace** agrega eventos detallados, localización, serialización y actividad de procesamiento. **Detallado** es extremadamente ruidoso y solo debe usarse brevemente cuando se solicite.

Cada entrada del registro XTM incluye el identificador XTM, la versión completa del mod y el nivel de mensaje.

## Seguimientos de pila y ventanas emergentes de error

Los controles de seguimiento de pila y ventanas emergentes de error están disponibles cuando se selecciona Depurar, Seguimiento o Registro detallado. Los seguimientos de pila agregan detalles de ubicación de código a las excepciones registradas. Las ventanas emergentes de error permiten que aparezcan errores del registrador XTM en la interfaz de usuario del juego.

Al volver al registro normal se desactivan ambos efectos.

![Sección de registro de las opciones de XTM con el selector de nivel, seguimientos de pila y ventanas emergentes de error](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Informar de un problema

Registre la versión mod, seleccione Depurar, reproduzca el problema una vez y use **Ir a la carpeta de registro**. Envíe el registro de XTM junto con los pasos que desencadenaron el problema y las versiones relevantes del juego y mod.

Utilice Trace sólo cuando la depuración sea insuficiente. Evite dejar Verbose habilitado. Regrese el registro a Normal después de recopilar el informe.
