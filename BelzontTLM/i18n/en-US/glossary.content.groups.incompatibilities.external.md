---
key: K45::XTM.vuio[glossary.content.groups.incompatibilities.external]
---
For each member line, XTM expects the vehicle-model list to exactly match the group's compositions, including order and primary and secondary models. Vanilla actions or another mod can conflict by rewriting that list.

XTM checks managed lines periodically and normally reapplies the group's compositions after a mismatch. Ticket-price conflicts are handled separately; this watchdog only monitors model selection.

## Conflict cutoff

**After the sixteenth detected mismatch, XTM stops enforcing the vehicle model group on that individual line.** The first fifteen mismatches can trigger reapplication; other members continue normally.

There is currently no visible conflict warning. Remove or disable the source of the conflicting changes, then edit the group or remove and reassign the affected line to resume enforcement. Reloading the city also clears this transient conflict state.
