---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM registra l'occupazione storica quando un passeggero o un veicolo merci termina l'imbarco e inizia a viaggiare verso la fermata successiva. Il campione appartiene al segmento diretto che inizia alla fermata di partenza.

Ogni segmento ha sei periodi: **00:00–04:00**, **04:00–08:00**, **08:00–12:00**, **12:00–16:00**, **16:00–20:00** e **20:00–24:00**. **Ora corrente** seleziona il periodo contenente l'ora di simulazione corrente. **Media giornaliera** è la media semplice dei periodi non obsoleti.

## Smussamento distorto dai picchi

Un campione superiore al valore memorizzato lo sostituisce immediatamente. Un campione inferiore mescola il 70% del valore precedente con il 30% del nuovo campione. La capacità segue la stessa regola. Ciò espone rapidamente l'affollamento improvviso mentre le ripetute partenze più silenziose riducono gradualmente la cronologia.

Un periodo diventa obsoleto quando il suo ultimo campione è più vecchio di ieri. I periodi obsoleti vengono visualizzati come lacune nel grafico e sono esclusi dalle medie, dagli intervalli di elenco e dalle classifiche. I valori della mappa mancanti o obsoleti attualmente vengono visualizzati come 0%.

![Cronologia dell'occupazione del segmento con sei periodi di quattro ore e la media giornaliera non obsoleta](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
