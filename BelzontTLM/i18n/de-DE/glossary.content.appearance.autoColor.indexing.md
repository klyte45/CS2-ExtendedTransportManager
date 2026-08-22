---
key: K45::XTM.vuio[glossary.content.appearance.autoColor.indexing]
---
Für eine gültige, nicht leere Zuweisung wählt XTM eine Palettenfarbe aus der **internen Routennummer** aus. Route 1 verwendet die erste Farbe, Route 2 die zweite und die Sequenz wird nach der letzten Farbe umbrochen.

Route 0 springt zur endgültigen Farbe und negative Routennummern werden in der Sequenz rückwärts fortgesetzt. Anzeigekennung, Akronym und Name haben keinen Einfluss auf die Indizierung.

Durch Ändern der internen Nummer kann sich die Routenfarbe ändern. Wenn Sie eine Palette bearbeiten oder neu anordnen, ändert sich die Farbe, die an jeder Position dargestellt wird.

Eine Route mit **Feste Farbe verwenden** ignoriert Zuweisungs-, Nummern- und Palettenänderungen, bis die Überschreibung entfernt wird. Wenn eine Zuweisung deaktiviert ist, fehlt oder leer ist, bleibt die aktuelle Farbe möglicherweise unverändert, wenn Sie zur Palettensteuerung zurückkehren.

![Palettenpositionen entsprechen den Routennummern](coui://xtm.k45/UI/images/xtm-palette-indexing.jpg)
