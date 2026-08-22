---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identität und Aussehen

Der farbige Diagonalstreifen zeigt die **Anzeigekennung** der Route. Ein nicht leeres Akronym hat Vorrang; andernfalls wird die interne Routennummer angezeigt. Wählen Sie die Kennung aus, um beide Werte zu bearbeiten.

![Linienkarte mit Identifikationsstreifen, Schild, Name, Typ, Statistik und Zeitplanstreifen](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

Das kleine Schild darunter zeigt das Transportsymbol. Seine Form richtet sich nach dem Transportmittel, Frachtrouten erhalten ein Frachtabzeichen und der Tag-, Nacht- oder Behindertenverkehr erhält ein farbiges Staatsabzeichen.

Wählen Sie das Schild aus, um die Farbauswahl zu öffnen. Durch die Auswahl einer Farbe wird eine feste Farbüberschreibung erstellt. Wenn der Route eine Palette zugewiesen ist und die Karte eine feste Überschreibung erkennt, gibt **Palettenfarbe wiederherstellen** die Steuerung zur automatischen Farbgebung zurück.

Wählen Sie den Routennamen aus, um ihn direkt umzubenennen. Beim Verlassen des Editors wird ein geänderter, nicht leerer Name übernommen. Escape bricht die Bearbeitung ab.

![Steuerelemente zur Kartenbearbeitung mit dem Bezeichner-Editor, dem Namensfeld und der Farbauswahl](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Typ und Details

Unterhalb des Namens gibt die Karte die lokalisierte Passagierlinien- oder Frachtroutenart an. Wählen Sie **Details** aus, um diese Route zu fokussieren und das ausgewählte Infofenster zu öffnen.

## Länge, Nachfrage und Fahrzeuge

Eine aktivierte Karte zeigt die Streckenlänge gefolgt von der monatlichen Passagier- oder Frachtstatistik. Passagierwerte werden als Anzahl mit der Passagierbezeichnung des Modus formatiert. Frachtwerte werden als lokalisiertes Gewicht formatiert.

Die nächste Zeile zeigt die Anzahl der aktiven Streckenfahrzeuge und einen historischen Belegungsbereich. Der Bereich ist die minimale und maximale effektive Auslastung an den Haltestellen der Route und sechs Zeitintervallen von je vier Stunden. Buckets, die älter als gestern sind, werden ignoriert.

Der Bereich verwendet Ein-Dezimal-Prozentsätze. Die Hintergrundfarbe folgt dem Maximalwert und erleichtert so das Erkennen stark belegter Routen. Eine neue Route oder eine Route ohne nutzbaren Verlauf kann **0,0 %~0,0 %** anzeigen.

Deaktivierte Karten zeigen weiterhin die Streckenlänge an, verbergen jedoch die Passagier- oder Frachtstatistik und ersetzen Fahrzeug- und Belegungsdaten durch **Strecke deaktiviert**.

## Dienstkontrollen

Der Streifen unten ändert die Route direkt zwischen Tag und Nacht, nur Tag, nur Nacht und behindertengerecht. Die hervorgehobene Schaltfläche zeigt den aktuellen Status an. Durch das Ändern dieser Steuerelemente wird auch aktualisiert, welcher Dienststatusfilter die Karte einschließt.
