---
key: K45::XTM.vuio[glossary.content.lines.identity.routeNumber]
---
The **internal route number** is the route's editable numeric number. It is separate from the route name, the optional display identifier, and the simulation entity itself.

Edit it by selecting the identifier on an XTM listing card and changing **Internal line number**, or in the selected route's **Line Data** section. The value is saved when the field loses focus. XTM does not require route numbers to be unique or positive.

## What uses this number

When no display identifier is set, the internal number is shown in generated names and XTM shields. Setting a display identifier changes that visible text but does not replace the internal number.

Numeric sorting and automatic palette colors continue to use the internal number. With a palette assigned, route 1 uses its first color, route 2 its second, and so on, wrapping around when the route number exceeds the palette length. Changing the number can therefore change the color of a palette-controlled route; fixed-color routes keep their chosen color.
