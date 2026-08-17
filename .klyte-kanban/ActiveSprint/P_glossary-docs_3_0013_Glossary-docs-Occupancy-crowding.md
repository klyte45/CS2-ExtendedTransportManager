**Start time:** 2026-08-17 00:46 -0300
# [0013] Glossary docs: Occupancy & crowding

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Occupancy & crowding topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Occupancy versus platform crowding" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.concepts.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "How occupancy is calculated" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.howCalculated.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Map display modes" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.mapDisplay.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Segment details" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.segmentDetails.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "City reports" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.cityReports.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Listing integration" in BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.listing.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified departure-based six-bucket history, peak-biased smoothing, stale handling, live platform crowding, map modes, segment charts, report ranking formulas, and listing integration.
2. Code caveats: map no-data appears as zero; values cap at 100%; daily averages are unweighted; platform capacity is volatile; reports are snapshots and capped; listing order can become stale.
3. Images required: xtm-occupancy-report-overview.jpg and xtm-occupancy-report-detail.jpg with report columns, filters, timestamps, rankings, sorting and drilldown visible.
4. Reuse xtm-linear-map-overlays.jpg, xtm-linear-map-segment-detail.jpg, xtm-line-card-anatomy.jpg and xtm-listing-sort-menu.jpg.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category statistics.occupancy under tab statistics (Statistics). Bodies: BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.concepts.md; BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.howCalculated.md; BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.mapDisplay.md; BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.segmentDetails.md; BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.cityReports.md; BelzontTLM/i18n/en-US/glossary.content.statistics.occupancy.listing.md

---

## otherNotes

Tab: Statistics | Category id: statistics.occupancy | Subsections: 6

---
