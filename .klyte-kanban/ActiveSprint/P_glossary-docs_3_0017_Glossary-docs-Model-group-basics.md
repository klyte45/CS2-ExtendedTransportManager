**Start time:** 2026-08-17 00:50 -0300
# [0017] Glossary docs: Model group basics

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Model group basics topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Transport-type and cargo scope" in BelzontTLM/i18n/en-US/glossary.content.groups.modelBasics.scope.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Creating, renaming, deleting" in BelzontTLM/i18n/en-US/glossary.content.groups.modelBasics.crud.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified immutable transport/cargo scope, creation prerequisites, autosave and naming, deletion and delayed association cleanup.
2. Corrected deletion semantics: the last applied VehicleModel buffer remains on former members.
3. Image required: xtm-model-groups-overview.jpg with scope menu, cards, editor, compositions and linked lines.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category groups.modelBasics under tab groups (Fares & Vehicle Models). Bodies: BelzontTLM/i18n/en-US/glossary.content.groups.modelBasics.scope.md; BelzontTLM/i18n/en-US/glossary.content.groups.modelBasics.crud.md

---

## otherNotes

Tab: Fares & Vehicle Models | Category id: groups.modelBasics | Subsections: 2

---
