---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Integrierte Übersetzungen

XTM lädt Englisch als Basissprache für jedes unterstützte Spielgebietsschema. Das aktuelle Paket enthält außerdem portugiesische (Brasilien) und koreanische CSV-Übersetzungen.

Wenn ein übersetzter Schlüssel fehlt oder leer ist, wird der englische CSV-Wert verwendet.

## CSV-Dateien

Die Hauptdatei **i18n.csv** enthält Sprachspalten. Eine separate Sprachdatei wie **ko-KR.csv** wird nur verwendet, wenn diese Sprache keine Spalte in der Hauptdatei hat.

CSV-Dateien sind durch Tabulatoren getrennt und erfordern eine Kopfzeile. Formatierungsplatzhalter wie geschweifte Klammern bleiben unverändert. Verwenden Sie die Literalsequenzen \n und \t, wenn ein CSV-Wert einen Zeilenumbruch oder ein Tabulatorzeichen benötigt.

## Markdown-Glossarkörper

Lange Glossareinträge verwenden eine Markdown-Datei pro Schlüssel unter **i18n/en-US**. Andere Sprachen können einzelne Einträge in ihrem eigenen Sprachordner überlagern. Eine fehlende übersetzte Markdown-Datei behält automatisch den englischen Text.

Für jede Markdown-Datei ist ein Frontmatter erforderlich, der **key:** oder **entry:** enthält, gefolgt vom zusammengesetzten Lokalisierungsschlüssel.

Markdown-Körper werden nach CSV-Einträgen geladen, sodass eine Markdown-Datei einen CSV-Wert mit demselben Schlüssel überschreibt.

## Übersetzungen testen

Verwenden Sie **Gehe zum Ordner „Übersetzungen“**, um das installierte XTM i18n-Verzeichnis zu öffnen. Nachdem Sie eine Datei bearbeitet haben, verwenden Sie **Übersetzungen neu laden**, um alle XTM-Lokalisierungsquellen zu entfernen und neu zu erstellen, ohne das Spiel neu zu starten.

![Optionsseite mit den Schaltflächen „Übersetzungsordner“ und „Neu laden“ neben den Verknüpfungen für Forum, Repository und Protokollordner](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Wenn bereits geöffneter Text nicht optisch aktualisiert wird, schließen Sie das Bedienfeld und öffnen Sie es nach dem erneuten Laden erneut.
