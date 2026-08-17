**Start time:** 2026-08-17 00:34 -0300
# [0012] Glossary docs: Advanced line data

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Advanced line data topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Waiting and loaded demand" in BelzontTLM/i18n/en-US/glossary.content.map.advanced.demand.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Full-lap estimate" in BelzontTLM/i18n/en-US/glossary.content.map.advanced.lap.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Average occupancy" in BelzontTLM/i18n/en-US/glossary.content.map.advanced.avgOccupancy.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified live passenger/cargo waiting and loaded sums, per-tick refresh, pathfinding-based round-trip estimate, live average formulas, platform capacity proxy, and historical stale-bucket handling.
2. Code caveats found: unpositioned vehicles are omitted from loaded demand; missing segment path data undercounts lap time; the estimate uses an undocumented fixed scaling heuristic; empty or zero-capacity routes can produce meaningless live averages.
3. Image required: _Frontends/UI/images/Encyclopedia/xtm-sip-advanced-line-data.jpg — selected passenger route with Line Data Advanced stats expanded; show waiting, loaded, expected round trip, both live averages, historical chart and daily average. A second cargo crop may demonstrate weight units.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-route-next-maintenance.jpg — related advanced panel context if captured broadly enough to include next-maintenance data.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category map.advanced under tab map (Map & Network). Bodies: BelzontTLM/i18n/en-US/glossary.content.map.advanced.demand.md; BelzontTLM/i18n/en-US/glossary.content.map.advanced.lap.md; BelzontTLM/i18n/en-US/glossary.content.map.advanced.avgOccupancy.md

---

## otherNotes

Tab: Map & Network | Category id: map.advanced | Subsections: 3

---
