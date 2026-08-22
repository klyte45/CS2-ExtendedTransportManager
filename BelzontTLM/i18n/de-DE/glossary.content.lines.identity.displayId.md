---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
Die **Anzeigekennung**, in manchen Steuerelementen auch Leitungsakronym oder Routenkennung genannt, ist ein optionaler Text, der anstelle der internen Routennummer angezeigt wird.

Wählen Sie die Kennung auf einer XTM-Eintragskarte aus, um das Akronym und die interne Nummer gemeinsam zu bearbeiten. Das Akronym kann auch im Abschnitt **Liniendaten** der ausgewählten Route bearbeitet werden. Deaktivieren Sie diese Option, um generierte Namen und XTM-Schilde an die interne Nummer zurückzugeben.

![Identifikator-Editor auf einer Linecard geöffnet, mit den Feldern für Akronym und interne Nummer](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Vorrang

Ein benutzerdefinierter Routenname bleibt unabhängig und wird nicht durch die Kennung ersetzt. Wenn das Spiel einen Routennamen generiert, wird eine nicht leere Kennung als Nummern-Token verwendet; andernfalls wird die interne Nummer verwendet.

XTM verwendet dieselbe Identifier-First-Regel für Schilde in der linearen Karte, Belegungsberichte, Tarifgruppen, Fahrzeugmodellgruppen und Segmentdetails. In der Auflistung wird es neben dem Transportschild angezeigt. Die automatische Farbauswahl und die numerische Sortierung verwenden weiterhin die interne Routennummer.

Halten Sie die Bezeichner kurz. Der Schildtext wird so verkleinert, dass er passt, und der gespeicherte Wert hat eine kleine UTF-8-Byte-Grenze.
