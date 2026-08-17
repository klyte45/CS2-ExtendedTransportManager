**End time:** 2026-08-17 00:57 -0300
**Start time:** 2026-08-17 00:56 -0300
# [0024] Glossary docs: Write Everywhere

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Write Everywhere topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Availability" in BelzontTLM/i18n/en-US/glossary.content.appearance.we.availability.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Steps and destination stops" in BelzontTLM/i18n/en-US/glossary.content.appearance.we.steps.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Dynamic and static keyframes" in BelzontTLM/i18n/en-US/glossary.content.appearance.we.keyframes.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Prefixes, suffixes, and clipboard" in BelzontTLM/i18n/en-US/glossary.content.appearance.we.extras.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified assembly/hook gating, SIP and glossary filtering, destination-step selection, defaults, first-stop behavior, static and dynamic keyframes, text types, persistence, prefix/suffix, and session-only full-replacement clipboard.
2. Recorded code caveats: route-update job does not write adjusted step values back; C# and UI choose different middle stops on odd routes; FixedString32 storage is shorter than UI maximum; static index and frame edge cases exist.
3. Images required: xtm-we-sip-entry.jpg, xtm-we-blinds-list.jpg, xtm-we-keyframes-editor.jpg and xtm-we-clipboard-actions.jpg.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category appearance.we under tab appearance (Palettes & Integrations). Bodies: BelzontTLM/i18n/en-US/glossary.content.appearance.we.availability.md; BelzontTLM/i18n/en-US/glossary.content.appearance.we.steps.md; BelzontTLM/i18n/en-US/glossary.content.appearance.we.keyframes.md; BelzontTLM/i18n/en-US/glossary.content.appearance.we.extras.md

---

## otherNotes

Tab: Palettes & Integrations | Category id: appearance.we | Subsections: 4

---
