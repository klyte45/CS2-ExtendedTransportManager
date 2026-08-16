---
key: K45::XTM.vuio[glossary.content.lines.identity.color]
---
Every route has a current color. XTM can either keep a **fixed color** chosen for that route or let an assigned city palette control it.

In the route's Selected Info Panel, enable **Use fixed color** to expose the color picker. In the XTM listing, selecting a new color from the card's shield automatically makes that route fixed. A fixed route keeps its color when its internal number, assigned palette, or palette contents change.

## Palette-controlled color

Palettes are assigned by transport type, separately for passenger lines and cargo routes, on the **Available palettes** screen. Passenger bus, tram, subway, train, ship, airplane, and ferry types support assignments. Cargo assignments are available for train, ship, and airplane routes.

Only palettes saved in the current city's palette library can be assigned. Imported or bundled library palettes must first be added to the city.

For a valid non-empty assignment, the internal route number selects a palette entry and wraps through the palette when necessary. The display identifier does not affect this selection.

Disable **Use fixed color**, or select **Restore palette color** on a listing card when offered, to return the route to palette control. If automatic coloring is disabled for that transport type, or its palette is missing or empty, removing the fixed override does not select a new color; the current color may remain.
