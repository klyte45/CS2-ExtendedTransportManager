---
key: K45::XTM.vuio[glossary.content.appearance.library.import]
---
Choose **Import palette** to open a file picker for `.hex` files. It starts in XTM's palette folder and includes an **XTM: Library** bookmark for bundled presets.

A `.hex` file contains one six-digit RGB color per line, with or without `#`. The filename becomes the city palette name. Blank or invalid lines are ignored, and at most the first 500 valid colors are imported.

Import creates a new city palette, even when a palette has the same name. To combine colors with an existing palette, select it and use **Append palette**.

![Disk and embedded sources in the palette picker](coui://xtm.k45/UI/images/xtm-palettes-library-import.jpg)
