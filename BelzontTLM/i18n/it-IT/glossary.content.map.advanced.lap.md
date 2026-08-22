---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
Il **Tempo di andata e ritorno previsto** in **Statistiche avanzate** stima il numero di minuti di gioco necessari a un veicolo per completare il percorso una volta.

XTM aggiunge la durata di individuazione del percorso di ogni segmento di percorso che contiene dati di percorso, calcola il totale con un fattore di stima fisso e aggiunge una piccola tolleranza fissa per fermata. Il risultato viene convertito in minuti di gioco utilizzando la durata del giorno della città.

Si tratta di una stima di pianificazione basata sui dati del percorso, non di una misurazione dei giri effettivi del veicolo. I segmenti senza dati sul percorso vengono saltati, quindi i percorsi incompleti possono sottostimare il risultato. Abbina il valore al conteggio dei veicoli quando si ragiona sui progressi; il pannello non calcola il progresso per te.

![Statistiche Line Data Advanced con tempo di andata e ritorno previsto visibile](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
