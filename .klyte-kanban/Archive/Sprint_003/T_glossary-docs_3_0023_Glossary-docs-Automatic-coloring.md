**End time:** 2026-08-17 00:56 -0300
**Start time:** 2026-08-17 00:55 -0300
# [0023] Glossary docs: Automatic coloring

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Automatic coloring topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Assign palette by transport type" in BelzontTLM/i18n/en-US/glossary.content.appearance.autoColor.assign.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Number-based indexing" in BelzontTLM/i18n/en-US/glossary.content.appearance.autoColor.indexing.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified supported passenger/cargo types, independent assignment persistence, exact (routeNumber - 1) modulo indexing, fixed-color exclusion and recalculation triggers.
2. Recorded implementation defects: update job reads setup metadata from prefab instead of route; palette edits bypass checksum recalculation; deleting assigned palette leaves a stale GUID; initial setup omits checksum.
3. Image required: xtm-palette-indexing.jpg; reuse xtm-palettes-overview.jpg for assignments.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category appearance.autoColor under tab appearance (Palettes & Integrations). Bodies: BelzontTLM/i18n/en-US/glossary.content.appearance.autoColor.assign.md; BelzontTLM/i18n/en-US/glossary.content.appearance.autoColor.indexing.md

---

## otherNotes

Tab: Palettes & Integrations | Category id: appearance.autoColor | Subsections: 2

---
