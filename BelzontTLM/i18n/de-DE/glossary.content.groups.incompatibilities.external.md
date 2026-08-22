---
key: K45::XTM.vuio[glossary.content.groups.incompatibilities.external]
---
Für jede Mitgliedslinie erwartet XTM, dass die Fahrzeugmodellliste genau mit der Zusammensetzung der Gruppe übereinstimmt, einschließlich der Reihenfolge sowie der Primär- und Sekundärmodelle. Vanilla-Aktionen oder ein anderer Mod können durch das Umschreiben dieser Liste zu Konflikten führen.

XTM überprüft verwaltete Zeilen regelmäßig und wendet die Zusammensetzungen der Gruppe normalerweise nach einer Nichtübereinstimmung erneut an. Ticketpreiskonflikte werden gesondert behandelt; Dieser Watchdog überwacht nur die Modellauswahl.

## Konfliktabschaltung

**Nach der sechzehnten erkannten Nichtübereinstimmung stoppt XTM die Durchsetzung der Fahrzeugmodellgruppe in dieser einzelnen Zeile.** Die ersten fünfzehn Nichtübereinstimmungen können eine erneute Anwendung auslösen; Andere Mitglieder machen normal weiter.

Derzeit gibt es keine sichtbare Konfliktwarnung. Entfernen oder deaktivieren Sie die Quelle der widersprüchlichen Änderungen, bearbeiten Sie dann die Gruppe oder entfernen Sie die betroffene Zeile und weisen Sie sie neu zu, um die Durchsetzung fortzusetzen. Durch das Neuladen der Stadt wird auch dieser vorübergehende Konfliktzustand beseitigt.
