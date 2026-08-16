---
key: K45::XTM.vuio[glossary.content.lines.listing.sorting]
---
## Sort keys

Open **Sort lines** to choose internal line number, line acronym, line length, historical usage, passengers or cargo per month, or scheduling state.

The default is internal line number with smaller numbers first.

**Line acronym** uses natural, case-insensitive text order. If a line has no acronym, its internal number is used as the sortable identifier.

**Line usage** uses the highest non-stale historical occupancy recorded across the route. Its primary direction puts the busiest lines first.

**Passengers/Cargo per month** also starts with the highest value first. Passenger and cargo values still remain inside their separate transport groups.

**Scheduling state** starts with Day & night, then Day only, Night only, and Disabled.

## Direction and grouping

Selecting a different key applies that key's primary direction. Selecting the same key again reverses it. The arrow therefore means the current direction, but not every key starts from the smallest numerical value: usage and passenger/cargo sorting deliberately start from the highest value.

Transport grouping is always preserved. Sorting reorders cards inside each bus, tram, train, ship, or other mode section; it does not produce one city-wide mixed ranking.

If live route data changes after sorting, select the sort key again when you need to refresh the exact order.
