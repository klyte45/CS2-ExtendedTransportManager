---
key: K45::XTM.vuio[glossary.content.lines.listing.cards]
---
## Identity and appearance

The colored diagonal stripe shows the route's **display identifier**. A non-empty acronym takes priority; otherwise the internal route number is shown. Select the identifier to edit both values.

![Line card with the identifier stripe, shield, name, type, statistics, and schedule strip](coui://xtm.k45/UI/images/xtm-line-card-anatomy.jpg)

The small shield below it shows the transport icon. Its shape follows the transport mode, cargo routes receive a cargo badge, and day-only, night-only, or disabled service receives a colored state badge.

Select the shield to open the color picker. Choosing a color creates a fixed-color override. When the route has an assigned palette and the card recognizes a fixed override, **Restore palette color** returns control to automatic coloring.

Select the route name to rename it in place. Leaving the editor commits a changed, non-empty name; Escape cancels the edit.

![Card editing controls with the identifier editor, name field, and color picker](coui://xtm.k45/UI/images/xtm-line-card-editing.jpg)

## Type and details

Below the name, the card identifies the localized passenger line or cargo route type. Select **Details** to focus that route and open its Selected Info Panel.

## Length, demand, and vehicles

An enabled card shows route length followed by its monthly passenger or cargo statistic. Passenger values are formatted as a count with the mode's passenger label. Cargo values are formatted as a localized weight.

The next row shows the number of active route vehicles and a historical occupancy range. The range is the minimum and maximum effective occupancy found across the route's stops and six four-hour time buckets. Buckets older than yesterday are ignored.

The range uses one-decimal percentages. Its background color follows the maximum value, making heavily occupied routes easier to spot. A new route or a route without usable history can show **0.0%~0.0%**.

Disabled cards still show route length, but hide the passenger or cargo statistic and replace vehicle and occupancy data with **Line disabled**.

## Service controls

The strip along the bottom changes the route directly between Day & night, Day only, Night only, and Disabled. The highlighted button is the current state. Changing these controls also updates which service-state filter includes the card.
