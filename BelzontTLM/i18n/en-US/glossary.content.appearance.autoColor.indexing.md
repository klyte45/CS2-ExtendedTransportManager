---
key: K45::XTM.vuio[glossary.content.appearance.autoColor.indexing]
---
For a valid non-empty assignment, XTM selects a palette color from the **internal route number**. Route 1 uses the first color, route 2 the second, and the sequence wraps after the last color.

Route 0 wraps to the final color, and negative route numbers continue backward through the sequence. Display identifier, acronym, and name do not affect indexing.

Changing the internal number can change the route color. Editing or reordering a palette changes the color represented by each position.

A route with **Use fixed color** ignores assignment, number, and palette changes until the override is removed. If an assignment is disabled, missing, or empty, returning to palette control may leave the current color unchanged.

![Palette positions matched to route numbers](coui://xtm.k45/UI/images/xtm-palette-indexing.jpg)
