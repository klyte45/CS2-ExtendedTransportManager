---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Użyj **Wyjątków godzinowych**, jeśli taryfa powinna różnić się od domyślnej w części dnia. **Dodaj wyjątek** tworzy zakres jednogodzinny w najwcześniejszej nieobjętej godzinie i kopiuje zaokrągloną stawkę domyślną.

Ustaw początek, koniec i cenę. Godziny trwają od 0 do 23 i uwzględniane są oba punkty końcowe: od 7 do 9 stosuje się od 07:00 do 09:59.

Początek nie może być późniejszy niż koniec, a zakresy nie mogą kończyć się na północy. Użyj dwóch wyjątków dla okresu nocnego. Wyjątki nie mogą się nakładać; ponieważ punkty końcowe są włączające, zakresy dzielące godzinę również powodują konflikt.

XTM obsługuje maksymalnie 20 wyjątków. Nieprawidłowe zakresy wyświetlają ostrzeżenie i blokują zapisanie wszystkich bieżących zmian w grupie do czasu ich naprawienia lub usunięcia.

Ustaw taryfę wyjątkową na **0**, aby móc korzystać z bezpłatnych przejazdów w tym zakresie.

![Wyjątki godzinowe z zakresami płatnymi i bezpłatnymi](coui://xtm.k45/UI/images/xtm-fare-group-hour-exceptions.jpg)
