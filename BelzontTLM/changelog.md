# v1.0.0r3 (29-APR-26)

- Fixed errors when opening unsupported transport lines in the line viewer.
- Fixed hex color input support for custom colors outside palette entries.
- Fixed default palette import to show files inside second-level subfolders.
- Updated Korean translation.

## FROM v1.0.0r2 (18-APR-26)

- Fixed UI being broken when entering in Editor
- Fixed auto color not affecting vehicles of a line immediately

## FROM v1.0.0r1 (17-APR-26)

- Fixed small weak points that could cause crashes in some edge cases, such as missing line data or null references in the line viewer.

## FROM v1.0.0r0 (15-APR-26)

- Removed all EUIS-related content and dependencies for a cleaner install and improved compatibility.
- Overhauled palette management: removed internal palette library concept, now using a unified city palette editor.
- Major new palette editor UI, including color picker, editing actions, and performance improvements.
- Added city palette selector and improved palette management workflow.
- Added editors for line internal numbers and acronyms.
- WE (Write Everywhere) integration window content on vanilla UI.
- Added details for all XTM-supported entities in the UI.
- XTM line viewer fully implemented, with map controls and improved navigation.
