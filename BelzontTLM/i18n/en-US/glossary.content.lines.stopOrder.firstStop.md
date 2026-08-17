---
key: K45::XTM.vuio[glossary.content.lines.stopOrder.firstStop]
---
Select a stop on the XTM linear map, then use the **1** button in **Stop Data** to make it the route's first stop. The button is disabled for the stop that is already first.

XTM rotates the route's stop order without reversing its direction. The chosen stop becomes the top of the full linear map and the starting terminus used by the symmetric half-trip view.

Changing the first stop also changes stop indices and Write Everywhere destination-blind boundaries. Destination text configured to use the end of the line resolves to the new first stop.

A symmetric route may stop qualifying for half-trip mode if you choose an intermediate platform. Choosing the opposite terminus normally preserves the out-and-back pairing while exchanging the two ends.

![Selected non-first stop with Stop Data showing the 1 and circular-arrow actions](coui://xtm.k45/UI/images/xtm-sip-first-stop.jpg)
