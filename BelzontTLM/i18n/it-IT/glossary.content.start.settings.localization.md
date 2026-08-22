---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Traduzioni integrate

XTM carica l'inglese come lingua di base per ogni locale di gioco supportata. Il pacchetto attuale contiene anche traduzioni CSV portoghese (Brasile) e coreano.

Quando una chiave tradotta manca o è vuota, viene utilizzato il valore CSV inglese.

## File CSV

Il file principale **i18n.csv** contiene colonne relative alla lingua. Un file di lingua separato come **ko-KR.csv** viene utilizzato solo quando quella lingua non ha colonne nel file principale.

I file CSV sono separati da tabulazioni e richiedono una riga di intestazione. Mantieni invariata la formattazione dei segnaposto come le parentesi graffe. Utilizza le sequenze letterali \n e \t quando un valore CSV richiede un'interruzione di riga o una tabulazione.

## Corpi del glossario Markdown

Le voci del glossario lungo utilizzano un file Markdown per chiave in **i18n/en-US**. Altre lingue possono sovrapporsi a singole voci nella propria cartella della lingua. Un file Markdown tradotto mancante mantiene automaticamente il corpo inglese.

Ogni file Markdown richiede un frontmatter contenente **chiave:** o **voce:** seguita dalla chiave di localizzazione assemblata.

I corpi Markdown vengono caricati dopo le voci CSV, quindi un file Markdown sovrascrive un valore CSV con la stessa chiave.

## Test delle traduzioni

Utilizza **Vai alla cartella Translations** per aprire la directory XTM i18n installata. Dopo aver modificato un file, utilizza **Ricarica traduzioni** per rimuovere e ricostruire tutte le fonti di localizzazione XTM senza riavviare il gioco.

![Pagina delle opzioni con la cartella delle traduzioni e i pulsanti di ricarica accanto ai collegamenti al forum, al repository e alla cartella dei registri](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Se il testo già aperto non si aggiorna visivamente, chiudi e riapri il pannello dopo averlo ricaricato.
