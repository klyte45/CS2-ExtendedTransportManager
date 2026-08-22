---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Livelli di registrazione

**Normale** registra informazioni ordinarie, avvisi ed errori ed è consigliato per il gioco regolare.

**Debug** aggiunge messaggi diagnostici dalle funzionalità XTM. **Trace** aggiunge attività dettagliate su eventi, localizzazione, serializzazione ed elaborazione. **Verbose** è estremamente rumoroso e dovrebbe essere utilizzato solo brevemente quando richiesto.

Ogni voce del registro XTM include l'identificatore XTM, la versione completa della mod e il livello del messaggio.

## Tracce dello stack e popup di errore

I controlli di analisi dello stack e popup di errore sono disponibili quando è selezionata la registrazione Debug, Traccia o Verbose. Le analisi dello stack aggiungono dettagli sulla posizione del codice alle eccezioni registrate. I popup di errore consentono di visualizzare gli errori del logger XTM nell'interfaccia utente del gioco.

Il ritorno alla registrazione normale disabilita entrambi gli effetti.

![Sezione di registrazione delle opzioni XTM con il selettore di livello, le analisi dello stack e i popup di errore](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Segnalazione di un problema

Registra la versione mod, seleziona Debug, riproduci il problema una volta e utilizza **Vai alla cartella di registro**. Invia il registro XTM insieme ai passaggi che hanno attivato il problema e le relative versioni del gioco e della mod.

Utilizzare Traccia solo quando il debug non è sufficiente. Evitare di lasciare abilitato Verbose. Ripristina la registrazione su Normale dopo aver raccolto il report.
