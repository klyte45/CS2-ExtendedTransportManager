---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
**Identyfikator wyświetlany**, w niektórych kontrolkach nazywany także akronimem linii lub identyfikatorem trasy, to opcjonalny tekst wyświetlany zamiast wewnętrznego numeru trasy.

Wybierz identyfikator na karcie aukcji XTM, aby edytować akronim i numer wewnętrzny. Akronim można także edytować w sekcji **Dane linii** wybranej trasy. Wyczyść tę opcję, aby wygenerowane nazwy i osłony XTM powróciły do ​​numeru wewnętrznego.

![Edytor identyfikatorów otwarty na karcie liniowej, z polami akronimu i numeru wewnętrznego](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Pierwszeństwo

Nazwa trasy niestandardowej pozostaje niezależna i nie jest zastępowana przez identyfikator. Kiedy gra generuje nazwę trasy, jako znacznik numeru używany jest niepusty identyfikator; w przeciwnym razie używany jest numer wewnętrzny.

XTM wykorzystuje tę samą zasadę „najpierw identyfikator” dla tarcz na mapie liniowej, w raportach o obłożeniu, grupach taryf, grupach modeli pojazdów i szczegółach segmentów. Lista wyświetla go obok tarczy transportowej. Automatyczny wybór kolorów i sortowanie numeryczne nadal korzystają z wewnętrznego numeru trasy.

Identyfikatory powinny być krótkie. Tekst osłony zmniejsza się, aby dopasować, a przechowywana wartość ma mały limit bajtów UTF-8.
