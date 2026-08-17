**Start time:** 2026-08-17 00:23 -0300
# [0009] Glossary docs: Stops & geography

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Stops & geography topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Stop names and buildings" in BelzontTLM/i18n/en-US/glossary.content.map.stops.names.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Distances" in BelzontTLM/i18n/en-US/glossary.content.map.stops.distances.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "District boundaries" in BelzontTLM/i18n/en-US/glossary.content.map.stops.districts.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Outside connections" in BelzontTLM/i18n/en-US/glossary.content.map.stops.outside.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified stop and top-level owner name resolution, route-path distance aggregation, schematic district transitions, and outside-connection presentation through the district overlay.
2. Code caveats found: parentless stops can expose an Entity.Null building action; displayed distance can omit missing path-info segments and uses unexplained wp text; district resolution prefers one road side and half-trip truncates transitions; outside stops have no unique marker or terminus behavior.
3. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-sip-stop-vehicle.jpg — show selected stop, Stop Data, and top-level building action.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-linear-map-overlays.jpg — show stop names, localized route distances, and schematic dashed district transitions.
5. Image required: _Frontends/UI/images/Encyclopedia/xtm-stops-outside-connections.jpg — genuine outside stop in full-loop mode with district overlay active, gold Colossal Nation label and ordinary stop bullet visible.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category map.stops under tab map (Map & Network). Bodies: BelzontTLM/i18n/en-US/glossary.content.map.stops.names.md; BelzontTLM/i18n/en-US/glossary.content.map.stops.distances.md; BelzontTLM/i18n/en-US/glossary.content.map.stops.districts.md; BelzontTLM/i18n/en-US/glossary.content.map.stops.outside.md

---

## otherNotes

Tab: Map & Network | Category id: map.stops | Subsections: 4

---
