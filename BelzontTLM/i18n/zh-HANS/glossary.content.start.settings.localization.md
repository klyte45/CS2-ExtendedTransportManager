---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## 内置翻译

XTM 加载英语作为每个受支持的游戏区域设置的基本语言。当前包还包含葡萄牙语（巴西）和韩语 CSV 翻译。

当翻译后的密钥丢失或为空时，将使用英文 CSV 值。

## CSV 文件

主要 **i18n.csv** 包含语言列。仅当该语言在主文件中没有列时，才使用单独的语言文件，例如 **ko-KR.csv**。

CSV 文件以制表符分隔，并且需要标题行。保持大括号等占位符的格式不变。当 CSV 值需要换行符或制表符时，请使用文字序列 \n 和 \t。

## Markdown 术语表主体

长词汇表条目在 **i18n/en-US** 下的每个键使用一个 Markdown 文件。其他语言可以在其自己的语言文件夹下覆盖各个条目。丢失的翻译 Markdown 文件会自动保留英文正文。

每个 Markdown 文件都需要包含 **key:** 或 **entry:** 的 frontmatter，后跟组装的本地化密钥。

Markdown 正文在 CSV 条目之后加载，因此 Markdown 文件会覆盖具有相同键的 CSV 值。

## 测试翻译

使用 **Go To Translations 文件夹** 打开已安装的 XTM i18n 目录。编辑文件后，使用 **重新加载翻译** 删除并重建所有 XTM 本地化源，而无需重新启动游戏。

![论坛、存储库和日志文件夹快捷方式旁边带有翻译文件夹和重新加载按钮的选项页面](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

如果已打开的文本在视觉上没有刷新，请在重新加载后关闭并重新打开该面板。
