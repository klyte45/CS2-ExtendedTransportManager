---
key: K45::XTM.vuio[glossary.content.statistics.occupancy.howCalculated]
---
XTM records historical occupancy when a passenger or cargo vehicle finishes boarding and starts travelling toward its next stop. The sample belongs to the directed segment beginning at the departure stop.

Each segment has six periods: **00:00–04:00**, **04:00–08:00**, **08:00–12:00**, **12:00–16:00**, **16:00–20:00**, and **20:00–24:00**. **Current hour** selects the period containing the current simulation hour. **Daily average** is the simple mean of non-stale periods.

## Peak-biased smoothing

A sample above the stored value replaces it immediately. A lower sample blends 70% of the previous value with 30% of the new sample. Capacity follows the same rule. This exposes sudden crowding quickly while repeated quieter departures reduce the history gradually.

A period becomes stale when its last sample is older than yesterday. Stale periods appear as chart gaps and are excluded from averages, listing ranges, and rankings. Missing or stale map values currently appear as 0%.

![Segment occupancy history with six four-hour periods and the non-stale daily average](coui://xtm.k45/UI/images/xtm-linear-map-segment-detail.jpg)
