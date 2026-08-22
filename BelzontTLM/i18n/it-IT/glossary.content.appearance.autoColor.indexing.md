---
key: K45::XTM.vuio[glossary.content.appearance.autoColor.indexing]
---
Per un'assegnazione valida e non vuota, XTM seleziona un colore della tavolozza dal **numero di percorso interno**. Il percorso 1 utilizza il primo colore, il percorso 2 il secondo e la sequenza prosegue dopo l'ultimo colore.

Il percorso 0 ritorna al colore finale e i numeri di percorso negativi continuano all'indietro nella sequenza. L'identificatore visualizzato, l'acronimo e il nome non influiscono sull'indicizzazione.

La modifica del numero interno può modificare il colore del percorso. La modifica o il riordino di una tavolozza cambia il colore rappresentato da ciascuna posizione.

Un percorso con **Usa colore fisso** ignora le modifiche di assegnazione, numero e tavolozza finché la sostituzione non viene rimossa. Se un'assegnazione è disabilitata, mancante o vuota, il ritorno al controllo della tavolozza potrebbe lasciare invariato il colore corrente.

![Posizioni della tavolozza corrispondenti ai numeri del percorso](coui://xtm.k45/UI/images/xtm-palette-indexing.jpg)
