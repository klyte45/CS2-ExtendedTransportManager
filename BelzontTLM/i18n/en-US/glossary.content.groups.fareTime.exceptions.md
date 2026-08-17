---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Use **Hour exceptions** when a fare should differ from the default during part of the day. **Add exception** creates a one-hour range in the earliest uncovered hour and copies the rounded default fare.

Set Start, End, and Fare. Hours run from 0 through 23 and both endpoints are included: 7 to 9 applies from 07:00 through 09:59.

The start cannot be later than the end, and ranges cannot wrap across midnight. Use two exceptions for an overnight period. Exceptions cannot overlap; because endpoints are inclusive, ranges sharing an hour also conflict.

XTM supports at most 20 exceptions. Invalid ranges show a warning and block all current group changes from saving until fixed or removed.

Set an exception fare to **0** for free travel during that range.

![Hour exceptions with paid and free ranges](coui://xtm.k45/UI/images/xtm-fare-group-hour-exceptions.jpg)
