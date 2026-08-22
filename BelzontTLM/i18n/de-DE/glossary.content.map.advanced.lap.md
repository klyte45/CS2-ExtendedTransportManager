---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
Die **Erwartete Hin- und Rückfahrtzeit** unter **Erweiterte Statistiken** gibt an, wie viele Spielminuten ein Fahrzeug benötigt, um die Route einmal abzuschließen.

XTM addiert die Wegfindungsdauer jedes Routensegments, das über Wegdaten verfügt, skaliert diese Summe mit einem festen Schätzfaktor und fügt pro Stopp einen kleinen festen Betrag hinzu. Das Ergebnis wird anhand der Tageslänge der Stadt in Spielminuten umgerechnet.

Hierbei handelt es sich um eine Planungsschätzung anhand von Streckendaten, nicht um eine Messung tatsächlicher Fahrzeugrunden. Segmente ohne Pfaddaten werden übersprungen, sodass unvollständige Routen das Ergebnis möglicherweise nicht ausreichend anzeigen. Kombinieren Sie den Wert mit der Fahrzeuganzahl, wenn Sie über den Abstand nachdenken. Das Panel berechnet den Fortschritt nicht für Sie.

![Line Data Advanced-Statistiken mit sichtbarer erwarteter Roundtrip-Zeit](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
