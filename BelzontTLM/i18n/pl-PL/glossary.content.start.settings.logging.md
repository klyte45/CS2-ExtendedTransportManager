---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Poziomy rejestrowania

Opcja **Normalna** rejestruje zwykłe informacje, ostrzeżenia i błędy i jest zalecana do regularnej rozgrywki.

**Debugowanie** dodaje komunikaty diagnostyczne z funkcji XTM. **Trace** dodaje szczegółowe informacje o zdarzeniach, lokalizacji, serializacji i przetwarzaniu. **Rozwlekły** jest bardzo głośny i powinien być używany tylko krótko, gdy zostanie o to poproszony.

Każdy wpis dziennika XTM zawiera identyfikator XTM, pełną wersję moda i poziom komunikatu.

## Ślady stosu i wyskakujące okienka z błędami

Kontrolki śledzenia stosu i wyskakujących okienek błędów są dostępne po wybraniu rejestrowania debugowania, śledzenia lub pełnego. Ślady stosu dodają szczegóły lokalizacji kodu do zarejestrowanych wyjątków. Wyskakujące okienka błędów pozwalają na pojawienie się błędów z rejestratora XTM w interfejsie gry.

Powrót do normalnego rejestrowania wyłącza oba efekty.

![Sekcja rejestrowania opcji XTM z selektorem poziomów, śladami stosu i wyskakującymi okienkami błędów](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Zgłaszanie problemu

Zapisz wersję moda, wybierz opcję Debuguj, odtwórz problem raz i użyj opcji **Przejdź do folderu dziennika**. Wyślij dziennik XTM wraz z krokami, które spowodowały problem, oraz wersjami odpowiednich gier i modów.

Używaj śledzenia tylko wtedy, gdy debugowanie jest niewystarczające. Unikaj pozostawiania włączonej opcji Verbose. Po zebraniu raportu przywróć rejestrowanie do stanu normalnego.
