---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Built-in translations

XTM loads English as the base language for every supported game locale. The current package also contains Portuguese (Brazil) and Korean CSV translations.

When a translated key is missing or blank, the English CSV value is used.

## CSV files

The main **i18n.csv** contains language columns. A separate language file such as **ko-KR.csv** is used only when that language has no column in the main file.

CSV files are tab-separated and require a header row. Keep formatting placeholders such as braces unchanged. Use the literal sequences \n and \t when a CSV value needs a line break or tab.

## Markdown glossary bodies

Long glossary entries use one Markdown file per key under **i18n/en-US**. Other languages can overlay individual entries under their own language folder. A missing translated Markdown file automatically keeps the English body.

Each Markdown file requires frontmatter containing **key:** or **entry:** followed by the assembled localization key.

Markdown bodies load after CSV entries, so a Markdown file overrides a CSV value with the same key.

## Testing translations

Use **Go To Translations folder** to open the installed XTM i18n directory. After editing a file, use **Reload translations** to remove and rebuild all XTM localization sources without restarting the game.

![Options page with the translations folder and reload buttons beside the forum, repository, and log folder shortcuts](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

If already-open text does not refresh visually, close and reopen that panel after reloading.
