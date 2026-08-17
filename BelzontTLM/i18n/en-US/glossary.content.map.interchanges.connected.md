---
key: K45::XTM.vuio[glossary.content.map.interchanges.connected]
---
**Connecting lines** is one of the XTM linear-map overlays and starts enabled. It draws a second railing beside the route, listing other transport routes found around each stop. Shields use the same route identity shown elsewhere in XTM.

Connections are not limited to the exact platform used by the displayed route. XTM searches the station or building that owns the stop, its attached road, and immediately adjoining roads. Nearby transport stops contribute their routes, while maintenance and work routes are excluded.

## Reading the shields

Each other route appears once per stop, even when it calls at several platforms of the same station. The displayed route is not repeated. Shields are ordered by transport type and then by internal route number, with subway routes grouped at the train priority.

When a stop has more than four connections, the shields are drawn smaller. The short bar beside the stop summarizes their colors: one solid color when all match, stripes for up to six colors, and gray when more than six distinct colors meet there.

## Limits

**Connecting lines** and **Vehicles** cannot be shown together. Selecting either overlay clears the other, and hiding vehicles does not restore connections automatically.

In **Half trip** mode, connections come only from the displayed outbound platform and are not merged with its paired return platform.

![Normal and compact connection groups with mixed transport types, color summary bar, and one hovered tooltip](coui://xtm.k45/UI/images/xtm-map-interchanges-compact.jpg)
