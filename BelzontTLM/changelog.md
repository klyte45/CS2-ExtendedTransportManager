# v1.1.0 (18-AUG-26)

- **XTM Encyclopedia**: Read it to get information about this mod capabilities
- **Line listing:** Rebuilt the public transport line list with sorting, schedule status filter and coloring, schedule toggles on cards, richer card info, and inline editors for name, color, number, and acronym. Listing filters and view state are kept while browsing. Access from X key (Transport Overview button). Can toggle to vanilla listing via (T) button.
- **Occupancy & crowdness:** Tracks segment usage at waypoints and shows occupancy on the line viewer (per segment, historical tooltips, chart popup), the XTM data panel graph, line listing usage data, and a dedicated occupancy report with column rankings. Crowdness indicators on vehicles and the linear map; selectable occupancy time source.
- **Fare groups:** Create and manage fare groups and apply them to lines from the SIP.
- **Vehicle model groups:** Group vehicle models and override the vanilla model selection for lines.
- **Line shields & SIP:** Line shields are rendered on the backend and show scheduling status when the line is not fully active. Improved line SIP layout, map refresh, and group controls.
- **Palettes:** Palette management moved into the transportation overview, with more default palettes, improved organization and UX, append/import workflows, drag-and-drop reordering, copy & paste colors, and a 500-color cap.
- Fixed various SIP, palette editor, and UI spacing/position issues; improved UI performance.

## FROM v1.0.0r5 (22-JUL-26)

- Fixing possible crash source when loading lines that have invalid prefab for line route