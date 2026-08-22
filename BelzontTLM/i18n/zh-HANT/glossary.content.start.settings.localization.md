---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## 內建翻譯

XTM 載入英語作為每個受支援的遊戲區域設定的基本語言。目前包還包含葡萄牙語（巴西）和韓語 CSV 翻譯。

當翻譯後的密鑰遺失或為空時，將使用英文 CSV 值。

## CSV 文件

主要 **i18n.csv** 包含語言列。只有當語言在主文件中沒有列時，才使用單獨的語言文件，例如 **ko-KR.csv**。

CSV 檔案以製表符分隔，並且需要標題行。保持大括號等佔位符的格式不變。當 CSV 值需要換行符號或製表符時，請使用文字序列 \n 和 \t。

## Markdown 名詞表主體

長詞彙表條目在 **i18n/en-US** 下的每個鍵使用一個 Markdown 文件。其他語言可以在其自己的語言資料夾下覆蓋各個條目。遺失的翻譯 Ma​​rkdown 檔案會自動保留英文正文。

每個 Markdown 檔案都需要包含 **key:** 或 **entry:** 的 frontmatter，後面跟著組裝的本地化金鑰。

Markdown 正文在 CSV 條目之後載入，因此 Markdown 檔案會覆寫具有相同鍵的 CSV 值。

## 測試翻譯

使用 **Go To Translations 資料夾** 開啟已安裝的 XTM i18n 目錄。編輯檔案後，使用 **重新載入翻譯** 刪除並重建所有 XTM 本地化來源，而無需重新啟動遊戲。

![論壇、儲存庫和日誌資料夾捷徑旁邊有翻譯資料夾和重新載入按鈕的選項頁](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

如果已開啟的文字在視覺上沒有刷新，請在重新載入後關閉並重新開啟該面板。
