---
key: K45::XTM.vuio[glossary.content.lines.stopOrder.symmetric]
---
XTM detects an out-and-back route when stops at mirrored positions share the same parent station or building. Detection uses route order and parent identity; it does not compare names, distance, or platform direction.

When **Half trip** is enabled and vehicles are hidden, the linear map shows the route from its first stop to the midpoint terminus. Intermediate outbound and return platforms share a split stop marker. Hover over it to inspect waiting passengers or cargo for each direction.

A triangle beside a selected stop shows whether its platform belongs to the outbound or return direction. Segment-occupancy values use down and up arrows for the two directions.

Enable vehicles or turn off **Half trip** to see the complete loop. Changing the first stop can change or disable symmetry detection because it rotates the positions used for pairing.
