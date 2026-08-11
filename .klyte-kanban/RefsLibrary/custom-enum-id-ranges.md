# BelzontTLM custom enum ID ranges

When this mod extends or parallels a vanilla numeric enum (or enum-like id) in the UI, allocate members from the reserved block below so values do not collide with:

- Future vanilla enum expansion (`0`, `1`, `2`, …)
- Other mods’ custom ranges

## Reserved block

| Field | Value |
|---|---|
| Pattern | `0xF4500XXX` |
| Inclusive range | `0xF4500000`–`0xF4500FFF` |
| Capacity | 4096 values (`XXX` = 12 bits) |
| Owner | BelzontTLM / Extended Transport Manager (XTM) |

Applies to **any** numeric enum this mod customizes — including `SelectedInfoPanelTab`-like SIP tabs and future similar hooks.

See also: [`sip-tabs-and-xtm-injection.md`](sip-tabs-and-xtm-injection.md) for SIP tab usage of this range.

## Allocated IDs

Document each new allocation here when implemented (or when planned and stable).

| Hex | Decimal | Enum / context | Purpose | Status |
|---|---|---|---|---|
| `0xF4500001` | 4099440641 | `SelectedInfoPanelTab` (mod parallel) | XTM SIP line-data tab | Planned (not implemented) |

## Allocation rules

1. Prefer sequential assignment within the block (next free `XXX`).
2. Never reuse a previously documented id for a different meaning.
3. Do not use small vanilla-adjacent integers (`2`, `3`, …) for mod-owned tabs or enum members.
4. When checking equality in UI (e.g. `selectedTab`), compare against the reserved constant — do not assume contiguous small integers when building gamepad / tab cycles.
