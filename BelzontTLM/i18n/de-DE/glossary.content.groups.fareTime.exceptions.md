---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Verwenden Sie **Stundenausnahmen**, wenn ein Tarif während eines Teils des Tages vom Standard abweichen sollte. **Ausnahme hinzufügen** erstellt einen einstündigen Bereich in der frühesten nicht abgedeckten Stunde und kopiert den gerundeten Standardtarif.

Legen Sie Start, Ende und Fahrpreis fest. Die Öffnungszeiten reichen von 0 bis 23 Uhr und beide Endpunkte sind inbegriffen: 7 bis 9 Uhr gilt von 07:00 bis 09:59 Uhr.

Der Start darf nicht später als das Ende liegen und die Bereiche dürfen nicht über Mitternacht hinausgehen. Nutzen Sie zwei Ausnahmen für einen Übernachtungszeitraum. Ausnahmen dürfen sich nicht überschneiden; Da Endpunkte inklusiv sind, kommt es auch zu Konflikten zwischen Bereichen, die sich eine Stunde teilen.

XTM unterstützt höchstens 20 Ausnahmen. Bei ungültigen Bereichen wird eine Warnung angezeigt und alle aktuellen Gruppenänderungen werden vom Speichern blockiert, bis sie behoben oder entfernt werden.

Legen Sie einen Ausnahmetarif auf **0** für kostenlose Fahrt in diesem Zeitraum fest.

![Stundenausnahmen bei kostenpflichtigen und kostenlosen Bereichen](coui://xtm.k45/UI/images/xtm-fare-group-hour-exclusions.jpg)
