**End time:** 2026-08-17 00:50 -0300
**Start time:** 2026-08-17 00:49 -0300
# [0016] Glossary docs: Fare membership

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Fare membership topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Assigning lines" in BelzontTLM/i18n/en-US/glossary.content.groups.fareMembership.assign.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Shared-change warning" in BelzontTLM/i18n/en-US/glossary.content.groups.fareMembership.shared.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified SIP assign/edit/remove/move actions, bulk membership filters, warning behavior, passenger-only editor scope, single-group membership and affected-member summaries.
2. Corrected the draft: valid edits auto-save without confirmation; removals retain the last applied ticket price.
3. Images required: xtm-fare-group-sip-membership-menu.jpg and xtm-fare-group-membership-editor.jpg; reuse xtm-sip-route-sections.jpg.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category groups.fareMembership under tab groups (Fares & Vehicle Models). Bodies: BelzontTLM/i18n/en-US/glossary.content.groups.fareMembership.assign.md; BelzontTLM/i18n/en-US/glossary.content.groups.fareMembership.shared.md

---

## otherNotes

Tab: Fares & Vehicle Models | Category id: groups.fareMembership | Subsections: 2

---
