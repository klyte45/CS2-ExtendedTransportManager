**Start time:** 2026-08-16 20:38 -0300
# [0004] Glossary docs: Listing & filters

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Listing & filters topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [ ] Document subsection "Transport modes" in BelzontTLM/i18n/en-US/glossary.content.lines.listing.modes.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Passenger and cargo filters" in BelzontTLM/i18n/en-US/glossary.content.lines.listing.passengerCargo.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Service-state filters" in BelzontTLM/i18n/en-US/glossary.content.lines.listing.serviceState.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Sorting" in BelzontTLM/i18n/en-US/glossary.content.lines.listing.sorting.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Reading line cards" in BelzontTLM/i18n/en-US/glossary.content.lines.listing.cards.md (accurate, complete, aligned with current behavior)
- [ ] Keep short title/category strings consistent with glossaryContent.ts
- [ ] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified ten supported passenger/cargo mode combinations, exclusion-based filters and presets, disabled-state precedence, per-mode grouped sorting, every card field/action, occupancy staleness, and units.
2. Code issue found outside this documentation task: ListLines/FillFromUITransportLine does not populate isFixedColor, so Restore palette color may disappear after refresh/remount until a new fixed color is picked.
3. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-passenger-cargo.jpg — show enabled passenger and cargo cards, distinct icons, people versus weight, and both quick filters.
4. Image required: _Frontends/UI/images/Encyclopedia/xtm-listing-filters.jpg — full listing with all ten type buttons, mixed selected states, four service filters, quick presets, visible count, and a type separator.
5. Image required: _Frontends/UI/images/Encyclopedia/xtm-listing-service-states.jpg — four same-mode cards configured day-and-night, day-only, night-only, and disabled, with card schedule strips and matching toolbar filters visible.
6. Image required: _Frontends/UI/images/Encyclopedia/xtm-listing-sort-menu.jpg — listing with all six sort keys readable; select usage or volume and show passenger/cargo train grouping.
7. Image required: _Frontends/UI/images/Encyclopedia/xtm-line-card-anatomy.jpg — close-up of enabled passenger, enabled cargo, and disabled cards with every identity, metric, detail, and schedule element legible.
8. Image required: _Frontends/UI/images/Encyclopedia/xtm-line-card-editing.jpg — two-panel capture of identifier editor and color picker with Restore palette color, using the same route.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category lines.listing under tab lines (Lines & Routes). Bodies: BelzontTLM/i18n/en-US/glossary.content.lines.listing.modes.md; BelzontTLM/i18n/en-US/glossary.content.lines.listing.passengerCargo.md; BelzontTLM/i18n/en-US/glossary.content.lines.listing.serviceState.md; BelzontTLM/i18n/en-US/glossary.content.lines.listing.sorting.md; BelzontTLM/i18n/en-US/glossary.content.lines.listing.cards.md

---

## otherNotes

Tab: Lines & Routes | Category id: lines.listing | Subsections: 5

---
