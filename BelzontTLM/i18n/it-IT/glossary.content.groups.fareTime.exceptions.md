---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Utilizza le **Eccezioni orarie** quando una tariffa deve differire da quella predefinita durante una parte della giornata. **Aggiungi eccezione** crea un intervallo di un'ora nella prima ora non coperta e copia la tariffa predefinita arrotondata.

Imposta Inizio, Fine e Tariffa. Gli orari vanno dalle 0 alle 23 ed entrambi gli endpoint sono inclusi: dalle 7 alle 9 si applica dalle 07:00 alle 09:59.

L'inizio non può essere successivo alla fine e gli intervalli non possono estendersi oltre la mezzanotte. Utilizzare due eccezioni per un periodo notturno. Le eccezioni non possono sovrapporsi; poiché gli endpoint sono inclusivi, anche gli intervalli che condividono un'ora sono in conflitto.

XTM supporta al massimo 20 eccezioni. Gli intervalli non validi mostrano un avviso e impediscono il salvataggio di tutte le modifiche del gruppo corrente fino alla correzione o alla rimozione.

Imposta una tariffa eccezionale su **0** per viaggiare gratuitamente in tale intervallo.

![Eccezioni orarie con orari a pagamento e gratuiti](coui://xtm.k45/UI/images/xtm-fare-group-hour-exception.jpg)
