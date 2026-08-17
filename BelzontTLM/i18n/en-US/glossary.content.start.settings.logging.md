---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Logging levels

**Normal** records ordinary information, warnings, and errors and is recommended for regular play.

**Debug** adds diagnostic messages from XTM features. **Trace** adds detailed event, localization, serialization, and processing activity. **Verbose** is extremely noisy and should be used only briefly when requested.

Each XTM log entry includes the XTM identifier, full mod version, and message level.

## Stack traces and error popups

Stack-trace and error-popup controls are available when Debug, Trace, or Verbose logging is selected. Stack traces add code-location detail to logged exceptions. Error popups allow errors from the XTM logger to appear in the game UI.

Returning to Normal logging disables both effects.

![Logging section of the XTM options with the level selector, stack traces, and error popups](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Reporting a problem

Record the mod version, select Debug, reproduce the problem once, and use **Go to log folder**. Send the XTM log together with the steps that triggered the issue and the relevant game and mod versions.

Use Trace only when Debug is insufficient. Avoid leaving Verbose enabled. Return logging to Normal after collecting the report.
