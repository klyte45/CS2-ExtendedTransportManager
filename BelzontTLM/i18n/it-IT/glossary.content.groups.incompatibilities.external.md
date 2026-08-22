---
key: K45::XTM.vuio[glossary.content.groups.incompatibilities.external]
---
Per ciascuna linea membro, XTM si aspetta che l'elenco dei modelli di veicoli corrisponda esattamente alle composizioni del gruppo, inclusi ordine e modelli primari e secondari. Le azioni Vanilla o un'altra mod possono entrare in conflitto riscrivendo l'elenco.

XTM controlla periodicamente le linee gestite e normalmente riapplica le composizioni del gruppo dopo una mancata corrispondenza. I conflitti sul prezzo dei biglietti vengono gestiti separatamente; questo watchdog monitora solo la selezione del modello.

## Interruzione del conflitto

**Dopo la sedicesima mancata corrispondenza rilevata, XTM interrompe l'applicazione del gruppo di modelli di veicolo su quella singola riga.** Le prime quindici discrepanze possono attivare una nuova richiesta; gli altri membri continuano normalmente.

Al momento non è presente alcun avviso di conflitto visibile. Rimuovi o disabilita l'origine delle modifiche in conflitto, quindi modifica il gruppo o rimuovi e riassegna la linea interessata per riprendere l'applicazione. Ricaricare la città cancella anche questo stato di conflitto transitorio.
