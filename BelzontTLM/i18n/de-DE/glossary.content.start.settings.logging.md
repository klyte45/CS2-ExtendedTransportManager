---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Protokollierungsstufen

**Normal** zeichnet normale Informationen, Warnungen und Fehler auf und wird für das regelmäßige Spielen empfohlen.

**Debug** fügt Diagnosemeldungen von XTM-Funktionen hinzu. **Trace** fügt detaillierte Ereignisse, Lokalisierung, Serialisierung und Verarbeitungsaktivität hinzu. **Verbose** ist extrem laut und sollte nur bei Aufforderung kurz verwendet werden.

Jeder XTM-Protokolleintrag enthält die XTM-Kennung, die vollständige Mod-Version und die Nachrichtenebene.

## Stack-Traces und Fehler-Popups

Stack-Trace- und Fehler-Popup-Steuerelemente sind verfügbar, wenn Debug, Trace oder Verbose-Protokollierung ausgewählt ist. Stack-Traces fügen protokollierten Ausnahmen Details zur Codeposition hinzu. Fehler-Popups ermöglichen die Anzeige von Fehlern des XTM-Loggers in der Benutzeroberfläche des Spiels.

Durch die Rückkehr zur normalen Protokollierung werden beide Effekte deaktiviert.

![Protokollierungsabschnitt der XTM-Optionen mit der Ebenenauswahl, Stack-Traces und Fehler-Popups](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Ein Problem melden

Notieren Sie die Mod-Version, wählen Sie „Debuggen“, reproduzieren Sie das Problem einmal und verwenden Sie **Zum Protokollordner gehen**. Senden Sie das XTM-Protokoll zusammen mit den Schritten, die das Problem ausgelöst haben, und den relevanten Spiel- und Mod-Versionen.

Verwenden Sie Trace nur, wenn Debug nicht ausreicht. Vermeiden Sie es, Verbose aktiviert zu lassen. Setzen Sie die Protokollierung nach der Erfassung des Berichts wieder auf „Normal“.
