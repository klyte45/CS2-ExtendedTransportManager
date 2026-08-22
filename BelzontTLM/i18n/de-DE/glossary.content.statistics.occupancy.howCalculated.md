---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM zeichnet die historische Belegung auf, wenn ein Passagier- oder Frachtfahrzeug mit dem Einsteigen fertig ist und sich auf den Weg zu seiner nächsten Haltestelle macht. Die Probe gehört zum gerichteten Segment, das an der Abfahrtshaltestelle beginnt.

Jedes Segment hat sechs Zeiträume: **00:00–04:00**, **04:00–08:00**, **08:00–12:00**, **12:00–16:00**, **16:00–20:00** und **20:00–24:00**. **Aktuelle Stunde** wählt den Zeitraum aus, der die aktuelle Simulationsstunde enthält. **Tagesdurchschnitt** ist der einfache Mittelwert der nicht veralteten Zeiträume.

## Peak-biasisierte Glättung

Ein Sample über dem gespeicherten Wert ersetzt diesen sofort. Eine niedrigere Probe mischt 70 % des vorherigen Werts mit 30 % der neuen Probe. Die Kapazität folgt der gleichen Regel. Dadurch wird ein plötzliches Gedränge schnell sichtbar, während wiederholte, ruhigere Abfahrten die Geschichte allmählich reduzieren.

Eine Periode wird veraltet, wenn ihr letztes Beispiel älter als gestern ist. Veraltete Zeiträume erscheinen als Diagrammlücken und werden von Durchschnittswerten, Auflistungsbereichen und Rankings ausgeschlossen. Fehlende oder veraltete Kartenwerte werden derzeit als 0 % angezeigt.

![Segmentbelegungsverlauf mit sechs Vier-Stunden-Zeiträumen und dem nicht veralteten Tagesdurchschnitt](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
