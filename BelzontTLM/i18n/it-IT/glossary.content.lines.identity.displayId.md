---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
L'**identificatore di visualizzazione**, chiamato anche acronimo di linea o identificatore di percorso in alcuni controlli, è un testo facoltativo mostrato al posto del numero di percorso interno.

Seleziona l'identificatore su una scheda di inserzione XTM per modificare insieme l'acronimo e il numero interno. L'acronimo può essere modificato anche nella sezione **Dati linea** della rotta selezionata. Cancellalo per restituire i nomi generati e gli scudi XTM al numero interno.

![Editor di identificatori aperto su una scheda di linea, con i campi dell'acronimo e del numero interno](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Precedenza

Un nome di percorso personalizzato rimane indipendente e non viene sostituito dall'identificatore. Quando il gioco genera un nome di percorso, viene utilizzato un identificatore non vuoto come token numerico; altrimenti viene utilizzato il numero interno.

XTM utilizza la stessa regola "prima l'identificatore" per gli scudi nella mappa lineare, nei report sull'occupazione, nei gruppi tariffari, nei gruppi di modelli di veicoli e nei dettagli dei segmenti. L'elenco lo mostra accanto allo scudo di trasporto. La selezione automatica del colore e l'ordinamento numerico utilizzano ancora il numero di percorso interno.

Mantieni gli identificatori brevi. Il testo protetto si restringe per adattarsi e il valore memorizzato ha un piccolo limite di byte UTF-8.
