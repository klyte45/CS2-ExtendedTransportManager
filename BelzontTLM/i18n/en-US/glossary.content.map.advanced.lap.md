---
key: K45::XTM.vuio[glossary.content.map.advanced.lap]
---
**Expected round trip time** under **Advanced stats** estimates how many game minutes a vehicle needs to complete the route once.

XTM adds the pathfinding duration of every route segment that has path data, scales that total with a fixed estimate factor, and adds a small fixed allowance per stop. The result is converted to game minutes using the city's day length.

This is a planning estimate from path data, not a measurement of actual vehicle laps. Segments without path data are skipped, so incomplete routes can under-report the result. Pair the value with vehicle count when reasoning about headways; the panel does not calculate headway for you.

![Line Data Advanced stats with expected round trip time visible](coui://xtm.k45/UI/images/xtm-sip-advanced-line-data.jpg)
