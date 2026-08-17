**Start time:** 2026-08-17 00:52 -0300
# [0020] Glossary docs: Incompatibilities

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Incompatibilities topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [x] Document subsection "External policy and model conflicts" in BelzontTLM/i18n/en-US/glossary.content.groups.incompatibilities.external.md (accurate, complete, aligned with current behavior)
- [x] Keep short title/category strings consistent with glossaryContent.ts
- [x] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Verified exact VehicleModel buffer comparison, periodic retries, per-line persistent cutoff, reset paths and absence of frontend warning.
2. Corrected the draft: cutoff is exactly the sixteenth detected mismatch; the first fifteen can reapply. Fare conflicts are separate.
3. No dedicated screenshot is useful because conflict state is not exposed in the UI; xtm-model-group-sip.jpg may provide generic context.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category groups.incompatibilities under tab groups (Fares & Vehicle Models). Bodies: BelzontTLM/i18n/en-US/glossary.content.groups.incompatibilities.external.md

---

## otherNotes

Tab: Fares & Vehicle Models | Category id: groups.incompatibilities | Subsections: 1

---
