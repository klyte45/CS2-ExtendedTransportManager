---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.concepts]
---
XTM shows two separate measurements: **vehicle occupancy** and **platform crowding**.

Vehicle occupancy records how full a vehicle was when it departed a stop toward the next stop. Passenger load excludes pets; cargo load sums carried resources. Multi-unit consists combine every unit's load and capacity. Historical percentages are capped at 100%.

Platform crowding compares the load currently waiting at a stop with the largest capacity among the route's positioned vehicles. It is a live visual reference, not the platform's physical capacity. Without a positioned vehicle or known capacity, crowding displays as zero.

On the linear map, increasingly crowded stop markers gain fill and a thicker border; ratios of 75% or more pulse. The tooltip can still report waiting load beyond one vehicle's capacity.

![Linear map with platform-crowding stop markers and segment-occupancy percentages](coui://xtm.k45/UI/images/xtm-linear-map-overlays.jpg)
