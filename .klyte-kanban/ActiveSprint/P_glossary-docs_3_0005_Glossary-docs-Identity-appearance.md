**Start time:** 2026-08-16 20:43 -0300
# [0005] Glossary docs: Identity & appearance

**Developed by:** Auto <auto@kwyt.com.br>
## User Story

> Acting as **a player reading the XTM encyclopedia**, I want **accurate documentation for the Identity & appearance topic group**, so that I **so the in-game glossary teaches that feature area clearly without leaving the game**.

---

## Background

Documentation-planning task for one XTM encyclopedia topic group. Expand each subsection body until it accurately documents current mod behavior. Draft markdown already ships for every subsection listed in Definition of Done.

---

## Definition of Ready (DoR)



---

## Acceptance Criteria / Definition of Done (DoD)

- [ ] Document subsection "Line name" in BelzontTLM/i18n/en-US/glossary.content.lines.identity.name.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Internal route number" in BelzontTLM/i18n/en-US/glossary.content.lines.identity.routeNumber.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Display identifier" in BelzontTLM/i18n/en-US/glossary.content.lines.identity.displayId.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Shield shapes and badges" in BelzontTLM/i18n/en-US/glossary.content.lines.identity.shields.md (accurate, complete, aligned with current behavior)
- [ ] Document subsection "Fixed color versus palette color" in BelzontTLM/i18n/en-US/glossary.content.lines.identity.color.md (accurate, complete, aligned with current behavior)
- [ ] Keep short title/category strings consistent with glossaryContent.ts
- [ ] Review the whole topic group against current UI behavior and terminology

---

## Implementation Notes

1. Research verified name generation and precedence, route-number editing and palette indexing, display-identifier storage and placement, exact shield shapes/badges, and fixed/palette color behavior.
2. Code caveats found outside this documentation task: display-identifier trimming differs between listing and SIP and lacks safe byte-length validation; auto-color update reads setup data from the prefab instead of the route owner and never updates paletteChecksum; fixed-color parsing does not enforce six RGB digits.
3. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-line-card-editing.jpg — identifier editor and color picker with Restore palette color, same route.
4. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-line-card-anatomy.jpg — names, identifiers, transport shield, color, and schedule controls legible across passenger/cargo/disabled cards.
5. Reuse image: _Frontends/UI/images/Encyclopedia/xtm-listing-service-states.jpg — same-mode routes showing all schedule badges.
6. Image required: _Frontends/UI/images/Encyclopedia/xtm-line-shield-shapes.jpg — arrange bus, tram, subway, train, ferry, ship, and airplane shields; include cargo examples and day-only/night-only/disabled/day-and-night states with both badge corners visible.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|

---

## Related Tasks

### Depends on



### Is dependent for



## reference

Category lines.identity under tab lines (Lines & Routes). Bodies: BelzontTLM/i18n/en-US/glossary.content.lines.identity.name.md; BelzontTLM/i18n/en-US/glossary.content.lines.identity.routeNumber.md; BelzontTLM/i18n/en-US/glossary.content.lines.identity.displayId.md; BelzontTLM/i18n/en-US/glossary.content.lines.identity.shields.md; BelzontTLM/i18n/en-US/glossary.content.lines.identity.color.md

---

## otherNotes

Tab: Lines & Routes | Category id: lines.identity | Subsections: 5

---
