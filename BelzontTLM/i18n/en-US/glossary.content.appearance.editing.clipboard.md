---
key: K45::XTM.vuio[glossary.content.appearance.editing.clipboard]
---
**Copy palette** writes one `#RRGGBB` color per line to the system clipboard.

**Paste palette (replace)** replaces the current draft sequence. **Paste palette (append)** adds valid clipboard colors to its end.

Lines may use six hexadecimal digits with or without `#`. Blank and invalid lines are ignored when at least one valid color exists. Replace and append keep at most 500 colors, silently omitting excess entries.

Pasting only changes the current draft. Choose **Save changes** to persist it or **Reset changes** to restore the saved palette.

![Palette clipboard controls and tooltips](coui://xtm.k45/UI/images/xtm-palette-clipboard.jpg)
