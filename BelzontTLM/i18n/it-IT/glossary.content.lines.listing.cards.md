---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identità e aspetto

La striscia diagonale colorata mostra l'**identificatore visualizzato** del percorso. Un acronimo non vuoto ha la priorità; altrimenti viene mostrato il numero del percorso interno. Seleziona l'identificatore per modificare entrambi i valori.

![Scheda di linea con striscia identificativa, scudo, nome, tipo, statistiche e striscia di pianificazione](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

Il piccolo scudo sottostante mostra l'icona del trasporto. La sua forma segue la modalità di trasporto, le rotte cargo ricevono un badge cargo e il servizio solo diurno, solo notturno o per disabili riceve un badge statale colorato.

Seleziona lo scudo per aprire il selettore colori. La scelta di un colore crea una sostituzione del colore fisso. Quando al percorso è assegnata una tavolozza e la scheda riconosce una sostituzione fissa, **Ripristina colore tavolozza** restituisce il controllo alla colorazione automatica.

Seleziona il nome del percorso per rinominarlo sul posto. Lasciando l'editor si conferma un nome modificato e non vuoto; Escape annulla la modifica.

![Controlli di modifica delle carte con l'editor degli identificatori, il campo del nome e il selettore dei colori](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Tipologia e dettagli

Sotto il nome, la carta identifica la linea passeggeri localizzata o il tipo di percorso merci. Seleziona **Dettagli** per mettere a fuoco quel percorso e aprire il relativo pannello Informazioni selezionato.

## Lunghezza, domanda e veicoli

Una carta abilitata mostra la lunghezza del percorso seguita dalle statistiche mensili sui passeggeri o sulle merci. I valori dei passeggeri vengono formattati come conteggio con l'etichetta passeggero della modalità. I valori del carico sono formattati come peso localizzato.

La riga successiva mostra il numero di veicoli sul percorso attivo e l'intervallo di occupazione storica. L'intervallo corrisponde all'occupazione effettiva minima e massima rilevata tra le fermate del percorso e in sei intervalli di tempo di quattro ore. I bucket più vecchi di ieri vengono ignorati.

L'intervallo utilizza percentuali di un decimale. Il colore dello sfondo segue il valore massimo, rendendo più facili da individuare i percorsi molto occupati. Un nuovo percorso o un percorso senza cronologia utilizzabile può mostrare **0,0%~0,0%**.

Le carte disabilitate mostrano ancora la lunghezza del percorso, ma nascondono le statistiche dei passeggeri o delle merci e sostituiscono i dati del veicolo e dell'occupazione con **Linea disabilitata**.

## Controlli di servizio

La striscia lungo il fondo cambia il percorso direttamente tra Giorno e notte, Solo giorno, Solo notte e Disabili. Il pulsante evidenziato rappresenta lo stato corrente. La modifica di questi controlli aggiorna anche il filtro dello stato del servizio che include la scheda.
