**Start time:** 2026-08-17 00:30 -0300
# [0011] Glossary docs: Vehicles

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Vehicles topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Live vehicle positions" in BelzontTLM/i18n/en-US/glossary.content.map.vehicles.live.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Next-arrival data" in BelzontTLM/i18n/en-US/glossary.content.map.vehicles.nextArrival.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Odometer and maintenance" in BelzontTLM/i18n/en-US/glossary.content.map.vehicles.odometer.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified vehicle-overlay defaults and exclusivity, normalized route-position rendering, marker load/capacity display, cyclic next-vehicle calculation, odometer source, maintenance range, and selection limits.
2. Code caveats found: marker strip uses equal stop spacing; cargo tooltips lack units; next arrival is positional rather than time-based; focus links may require two activations; maintenance remaining can be negative and unsupported vehicles may expose a negative range.
3. Image required: _Frontends/UI/images/Encyclopedia/xtm-linear-map-vehicles.jpg — full route with Vehicles selected, Connections off, several markers, one selected marker, and readable passenger load/capacity tooltip.
4. Image required: _Frontends/UI/images/Encyclopedia/xtm-route-next-maintenance.jpg — selected route with Line Data Advanced data open and next-maintenance vehicle name plus remaining distance readable.
5. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-sip-stop-vehicle.jpg — show next-arrival Stop Data together with selected Vehicle Data odometer and maintenance range.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category map.vehicles under tab map (Map & Network). Bodies: BelzontTLM/i18n/en-US/glossary.content.map.vehicles.live.md; BelzontTLM/i18n/en-US/glossary.content.map.vehicles.nextArrival.md; BelzontTLM/i18n/en-US/glossary.content.map.vehicles.odometer.md

---

## otherNotes

Tab: Map & Network | Category id: map.vehicles | Subsections: 3

---
