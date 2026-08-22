---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Wbudowane tłumaczenia

XTM ładuje język angielski jako język podstawowy dla każdej obsługiwanej lokalizacji gry. Bieżący pakiet zawiera także tłumaczenia CSV na język portugalski (Brazylia) i koreański.

Jeśli brakuje przetłumaczonego klucza lub jest on pusty, używana jest angielska wartość CSV.

## Pliki CSV

Główny plik **i18n.csv** zawiera kolumny językowe. Oddzielny plik językowy, taki jak **ko-KR.csv**, jest używany tylko wtedy, gdy ten język nie ma kolumny w pliku głównym.

Pliki CSV są oddzielane tabulatorami i wymagają wiersza nagłówka. Zachowaj niezmienione elementy zastępcze formatowania, takie jak nawiasy klamrowe. Użyj sekwencji literałów \n i \t, gdy wartość CSV wymaga podziału wiersza lub tabulatora.

## Glosariusz Markdown

Długie wpisy w glosariuszu wykorzystują jeden plik Markdown na klucz w **i18n/en-US**. Inne języki mogą nakładać poszczególne wpisy w ich własnym folderze językowym. Brakujący przetłumaczony plik Markdown automatycznie zachowuje treść w języku angielskim.

Każdy plik Markdown wymaga okładki zawierającej **key:** lub **entry:**, po której następuje złożony klucz lokalizacji.

Treści Markdown ładują się po wpisach CSV, więc plik Markdown zastępuje wartość CSV z tym samym kluczem.

## Testowanie tłumaczeń

Użyj **Przejdź do folderu Tłumaczenia**, aby otworzyć zainstalowany katalog XTM i18n. Po edycji pliku użyj opcji **Załaduj ponownie tłumaczenia**, aby usunąć i odbudować wszystkie źródła lokalizacji XTM bez ponownego uruchamiania gry.

![Strona opcji z folderem tłumaczeń i przyciskami ponownego ładowania obok forum, repozytorium i skrótami do folderu dziennika](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Jeśli już otwarty tekst nie odświeża się wizualnie, zamknij i otwórz ten panel ponownie po ponownym załadowaniu.
