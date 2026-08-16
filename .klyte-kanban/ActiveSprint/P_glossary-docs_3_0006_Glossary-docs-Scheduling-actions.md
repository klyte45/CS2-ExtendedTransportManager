**Start time:** 2026-08-16 20:47 -0300
# [0006] Glossary docs: Scheduling & actions

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Scheduling & actions topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [ ] Document subsection "Day and night" in BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.dayNight.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Day only" in BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.dayOnly.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Night only" in BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.nightOnly.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Disabled" in BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.disabled.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Opening line details" in BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.openDetails.md (accurate, complete, aligned with current behavior)
- [ ] Keep short title/category strings consistent with glossaryContent.ts
- [ ] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified exact active/schedule mappings, card mutation sequence, indicators and filter behavior, disabled-report exclusion, Details navigation, SIP tools, and single-selection limits.
2. Code caveats found outside this documentation task: schedule-sorted cards do not reposition after schedule changes; active schedule changes issue two unordered triggers without rollback; schedule controls lack keyboard/accessibility metadata; unknown active schedules render as Day & night.
3. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-listing-service-states.jpg — all four same-mode schedule states with toolbar filters, selected strip colors, badges, and Line disabled visible.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-line-card-anatomy.jpg — tight enabled/disabled card view with Details and all four schedule buttons readable.
5. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-route-tools.jpg — selected route SIP and enhanced map with route shield, stops, a vehicle, and connected-line shields.
6. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-sip-route-sections.jpg — selected route Color, Ticket Price, vehicle selection, and Line Data sections; include WE only when available.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category lines.scheduling under tab lines (Lines & Routes). Bodies: BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.dayNight.md; BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.dayOnly.md; BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.nightOnly.md; BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.disabled.md; BelzontTLM/i18n/en-US/glossary.content.lines.scheduling.openDetails.md

---

## otherNotes

Tab: Lines & Routes | Category id: lines.scheduling | Subsections: 5

---
