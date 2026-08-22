---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Tożsamość i wygląd

Kolorowy ukośny pasek pokazuje **wyświetlany identyfikator** trasy. Priorytet ma niepusty akronim; w przeciwnym razie wyświetlany jest numer trasy wewnętrznej. Wybierz identyfikator, aby edytować obie wartości.

![Karta linii z paskiem identyfikacyjnym, tarczą, nazwą, typem, statystyką i paskiem harmonogramu](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

Mała tarcza poniżej pokazuje ikonę transportu. Jego kształt jest zgodny ze środkiem transportu, trasy towarowe otrzymują plakietkę cargo, a usługi działające tylko w dzień, tylko w nocy lub dla osób niepełnosprawnych otrzymują kolorową plakietkę stanu.

Wybierz tarczę, aby otworzyć próbnik kolorów. Wybranie koloru powoduje nadpisanie stałego koloru. Gdy trasa ma przypisaną paletę, a karta rozpozna stałe zastąpienie, opcja **Przywróć kolor palety** przywraca sterowanie do automatycznego kolorowania.

Wybierz nazwę trasy, aby zmienić jej nazwę. Opuszczenie edytora powoduje zmianę zmienionej, niepustej nazwy; Escape anuluje edycję.

![Edycja kart z edytorem identyfikatorów, polem nazwy i próbnikiem kolorów](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Typ i szczegóły

Pod nazwą karta wskazuje zlokalizowaną linię pasażerską lub typ trasy cargo. Wybierz **Szczegóły**, aby skupić się na tej trasie i otworzyć panel wybranych informacji.

## Długość, popyt i pojazdy

Włączona karta pokazuje długość trasy oraz jej miesięczne statystyki dotyczące pasażerów lub ładunku. Wartości pasażerów są formatowane jako liczba z etykietą pasażera trybu. Wartości ładunku są formatowane jako zlokalizowana waga.

Następny wiersz pokazuje liczbę pojazdów na aktywnej trasie i historyczny zakres obłożenia. Zakres to minimalne i maksymalne efektywne obłożenie na przystankach trasy oraz w sześciu czterogodzinnych segmentach czasu. Zasobniki starsze niż wczoraj są ignorowane.

W zakresie zastosowano wartości procentowe jednodziesiętne. Kolor tła odpowiada wartości maksymalnej, dzięki czemu trasy o dużym natężeniu ruchu są łatwiejsze do zauważenia. Nowa trasa lub trasa bez użytecznej historii może wyświetlać **0,0% ~ 0,0%**.

Wyłączone karty nadal pokazują długość trasy, ale ukrywają statystyki pasażerów lub ładunku i zastępują dane pojazdu i obłożenia wartością **Linia wyłączona**.

## Kontrola usług

Pasek na dole zmienia trasę bezpośrednio pomiędzy Dzień i noc, Tylko dzień, Tylko noc i Niepełnosprawni. Podświetlony przycisk oznacza bieżący stan. Zmiana tych elementów sterujących powoduje również aktualizację filtru stanu usługi obejmującego kartę.
