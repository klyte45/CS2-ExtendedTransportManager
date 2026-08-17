**End time:** 2026-08-17 00:48 -0300
**Start time:** 2026-08-17 00:47 -0300
# [0014] Glossary docs: Fare groups

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Fare groups topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Creating and deleting groups" in BelzontTLM/i18n/en-US/glossary.content.groups.fareBasics.create.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Default fare and free travel" in BelzontTLM/i18n/en-US/glossary.content.groups.fareBasics.default.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified creation defaults, naming, list cards, deletion, default-fare clamping, free travel, exception precedence, propagation and membership cleanup.
2. Caveat: deleting a group does not restore former lines' earlier fares; valid saves are optimistic and automatic.
3. Images required: xtm-fare-groups-editor.jpg and xtm-fare-groups-default-fare.jpg.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category groups.fareBasics under tab groups (Fares & Vehicle Models). Bodies: BelzontTLM/i18n/en-US/glossary.content.groups.fareBasics.create.md; BelzontTLM/i18n/en-US/glossary.content.groups.fareBasics.default.md

---

## otherNotes

Tab: Fares & Vehicle Models | Category id: groups.fareBasics | Subsections: 2

---
