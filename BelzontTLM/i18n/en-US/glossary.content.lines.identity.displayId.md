---
key: K45::XTM.vuio[glossary.content.lines.identity.displayId]
---
The **display identifier**, also called the line acronym or route identifier in some controls, is optional text shown in place of the internal route number.

Select the identifier on an XTM listing card to edit the acronym and internal number together. The acronym can also be edited in the selected route's **Line Data** section. Clear it to return generated names and XTM shields to the internal number.

![Identifier editor open on a line card, with the acronym and internal number fields](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Precedence

A custom route name remains independent and is not replaced by the identifier. When the game generates a route name, a non-empty identifier is used as its number token; otherwise the internal number is used.

XTM uses the same identifier-first rule for shields in the linear map, occupancy reports, fare groups, vehicle model groups, and segment details. The listing displays it beside the transport shield. Automatic color selection and numeric sorting still use the internal route number.

Keep identifiers short. Shield text shrinks to fit, and the stored value has a small UTF-8 byte limit.
