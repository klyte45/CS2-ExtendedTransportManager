**Start time:** 2026-08-17 00:53 -0300
# [0021] Glossary docs: Palette library

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Palette library topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "City palettes" in BelzontTLM/i18n/en-US/glossary.content.appearance.library.city.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Default library" in BelzontTLM/i18n/en-US/glossary.content.appearance.library.default.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Importing .hex files" in BelzontTLM/i18n/en-US/glossary.content.appearance.library.import.md (accurate, complete, aligned with current behavior)
- [x] Document subsection "Editor-mode access" in BelzontTLM/i18n/en-US/glossary.content.appearance.library.editor.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified city-save persistence, GUID identity, embedded preset hierarchy, disk parsing and limits, append behavior, editor preload setting and shared dialog.
2. Corrected drafts: presets are imported rather than copied directly; editor access edits the current editor world, not an offline library.
3. Images required: xtm-palettes-overview.jpg and xtm-palettes-library-import.jpg. Recapture existing xtm-editor-palettes.jpg in the actual Asset Editor.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category appearance.library under tab appearance (Palettes & Integrations). Bodies: BelzontTLM/i18n/en-US/glossary.content.appearance.library.city.md; BelzontTLM/i18n/en-US/glossary.content.appearance.library.default.md; BelzontTLM/i18n/en-US/glossary.content.appearance.library.import.md; BelzontTLM/i18n/en-US/glossary.content.appearance.library.editor.md

---

## otherNotes

Tab: Palettes & Integrations | Category id: appearance.library | Subsections: 4

---
