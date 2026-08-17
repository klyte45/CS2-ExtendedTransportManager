**Start time:** 2026-08-17 00:26 -0300
# [0010] Glossary docs: Interchanges

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Interchanges topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Connected lines" in BelzontTLM/i18n/en-US/glossary.content.map.interchanges.connected.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Selecting linked routes" in BelzontTLM/i18n/en-US/glossary.content.map.interchanges.select.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified station/building/road-neighborhood route discovery, work-route exclusion, frontend deduplication and type/number sorting, compact shield thresholds, selection behavior, and half-trip limitations.
2. Code caveats found: vehicle and connection overlays are mutually exclusive without automatic restoration; return-platform connections are omitted in half trip; connection stop metadata is unused; unknown line entries are skipped; odd symmetry check remains broken.
3. Image required: _Frontends/UI/images/Encyclopedia/xtm-map-interchanges-compact.jpg — show normal and compact connection groups together, more than six distinct colors producing a gray stem, mixed transport types, one hovered tooltip, Connecting lines on and Vehicles off.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-route-tools.jpg — show the Selected Info Panel and map after selecting a linked route.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category map.interchanges under tab map (Map & Network). Bodies: BelzontTLM/i18n/en-US/glossary.content.map.interchanges.connected.md; BelzontTLM/i18n/en-US/glossary.content.map.interchanges.select.md

---

## otherNotes

Tab: Map & Network | Category id: map.interchanges | Subsections: 2

---
