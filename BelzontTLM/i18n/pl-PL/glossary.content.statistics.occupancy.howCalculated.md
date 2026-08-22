---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM rejestruje historyczne obłożenie, gdy pojazd pasażerski lub towarowy kończy wsiadanie i rozpoczyna podróż do następnego przystanku. Próbka należy do segmentu kierowanego rozpoczynającego się na przystanku odjazdu.

Każdy segment ma sześć okresów: **00:00–04:00**, **04:00–08:00**, **08:00–12:00**, **12:00–16:00**, **16:00–20:00** i **20:00–24:00**. **Aktualna godzina** wybiera okres zawierający aktualną godzinę symulacji. **Średnia dzienna** to prosta średnia okresów, w których nie występują przeterminowania.

## Wygładzanie zależne od szczytu

Próbka powyżej zapisanej wartości natychmiast ją zastępuje. Niższa próbka łączy 70% poprzedniej wartości z 30% nowej próbki. Pojemność podlega tej samej zasadzie. To szybko ujawnia nagłe zatłoczenie, a powtarzające się cichsze odjazdy stopniowo redukują historię.

Okres staje się nieaktualny, gdy jego ostatnia próbka jest starsza niż wczoraj. Przestarzałe okresy pojawiają się jako luki na wykresach i są wyłączone ze średnich, zakresów zestawień i rankingów. Brakujące lub nieaktualne wartości map są obecnie wyświetlane jako 0%.

![Historia zajętości segmentu z sześcioma czterogodzinnymi okresami i nieaktualną średnią dzienną](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
