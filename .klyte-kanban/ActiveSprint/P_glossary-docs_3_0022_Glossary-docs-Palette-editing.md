**Start time:** 2026-08-17 00:54 -0300
# [0022] Glossary docs: Palette editing

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Palette editing topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "Add and reorder colors" in BelzontTLM/i18n/en-US/glossary.content.appearance.editing.colors.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Copy, paste, replace, append" in BelzontTLM/i18n/en-US/glossary.content.appearance.editing.clipboard.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified white-color append, picker, remove/reorder/shuffle, save/reset/rename semantics, file append, clipboard parsing and 500-color cap.
2. Caveats recorded: visible numbering may become misleading after reorder/shuffle; excess pasted colors truncate; paste is a draft until saved.
3. Images required: xtm-palette-color-editing.jpg and xtm-palette-clipboard.jpg.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category appearance.editing under tab appearance (Palettes & Integrations). Bodies: BelzontTLM/i18n/en-US/glossary.content.appearance.editing.colors.md; BelzontTLM/i18n/en-US/glossary.content.appearance.editing.clipboard.md

---

## otherNotes

Tab: Palettes & Integrations | Category id: appearance.editing | Subsections: 2

---
