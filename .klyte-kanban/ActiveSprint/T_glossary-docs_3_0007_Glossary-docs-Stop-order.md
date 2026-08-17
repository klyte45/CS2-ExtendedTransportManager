**End time:** 2026-08-17 00:16 -0300
**Start time:** 2026-08-17 00:12 -0300
# [0007] Glossary docs: Stop order

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Stop order topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "First stop" in BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.firstStop.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Symmetric routes" in BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.symmetric.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Opposite platforms" in BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.opposite.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified canonical RouteWaypoint rotation for first-stop changes, frontend parent/order-based symmetry detection, half-trip consequences, and same-parent opposite-platform lookup.
2. Code caveats found: odd-length symmetry check uses length % 1; parentless stops can falsely pair; SetFirstStop has unsafe buffer handling and questionable alias disposal; frontend mutation is not awaited; WE cached stop order may not be written back.
3. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-sip-stop-vehicle.jpg — show selected non-first stop and Stop Data with the 1 and circular-arrow actions readable.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-linear-map-overlays.jpg — show symmetric half-trip view with split platform markers, direction triangle, paired occupancy arrows, and Half trip selected.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category lines.stopOrder under tab lines (Lines & Routes). Bodies: BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.firstStop.md; BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.symmetric.md; BelzontTLM/i18n/en-US/glossary.content.lines.stopOrder.opposite.md

---

## otherNotes

Tab: Lines & Routes | Category id: lines.stopOrder | Subsections: 3

---
