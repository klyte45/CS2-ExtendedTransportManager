---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
**Oczekiwany czas podróży w obie strony** w sekcji **Zaawansowane statystyki** szacuje, ile minut gry potrzebuje pojazd, aby jednokrotnie pokonać trasę.

XTM dodaje czas wyszukiwania ścieżki dla każdego segmentu trasy, który zawiera dane o trasie, skaluje tę sumę przy użyciu stałego współczynnika szacunkowego i dodaje niewielki stały dodatek na przystanek. Wynik jest przeliczany na minuty gry na podstawie długości dnia w mieście.

Jest to szacunkowy plan na podstawie danych dotyczących trasy, a nie pomiar rzeczywistych okrążeń pojazdu. Segmenty bez danych ścieżki są pomijane, więc niekompletne trasy mogą powodować zaniżenie wyniku. Połącz wartość z liczbą pojazdów, rozważając postępy; panel nie oblicza dla Ciebie odstępu.

![Zaawansowane statystyki Line Data z widocznym oczekiwanym czasem podróży w obie strony](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
