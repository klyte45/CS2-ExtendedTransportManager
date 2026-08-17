**End time:** 2026-08-17 00:23 -0300
**Start time:** 2026-08-17 00:16 -0300
# [0008] Glossary docs: XTM linear map

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the XTM linear map topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Switching from vanilla" in BelzontTLM/i18n/en-US/glossary.content.map.linear.switch.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "White background" in BelzontTLM/i18n/en-US/glossary.content.map.linear.whiteBg.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Half-trip mode" in BelzontTLM/i18n/en-US/glossary.content.map.linear.halfTrip.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified toolbar order, XTM/vanilla fallback, module-session defaults, vehicle/interchange exclusivity, light-canvas styling, and half-trip eligibility/output.
2. Code caveats found: broken odd-stop symmetry test and unsafe degenerate routes; selected Half trip can be visually inactive with vehicles; return-platform interchanges are omitted; stale route data can persist while loading or after unsupported data.
3. Image required: _Frontends/UI/images/Encyclopedia/xtm-linear-map-switch.jpg — before/after composite of the same route in vanilla and XTM visualizer modes with the leftmost toggle visible.
4. Image required: _Frontends/UI/images/Encyclopedia/xtm-linear-map-white-background.jpg — same route with the diamond button selected, light-gray canvas, dark inherited text and district lines visible.
5. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-linear-map-overlays.jpg — show toolbar, split half-trip stops, distances, interchanges, crowding, and directional occupancy with vehicles off.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category map.linear under tab map (Map & Network). Bodies: BelzontTLM/i18n/en-US/glossary.content.map.linear.switch.md; BelzontTLM/i18n/en-US/glossary.content.map.linear.whiteBg.md; BelzontTLM/i18n/en-US/glossary.content.map.linear.halfTrip.md

---

## otherNotes

Tab: Map & Network | Category id: map.linear | Subsections: 3

---
