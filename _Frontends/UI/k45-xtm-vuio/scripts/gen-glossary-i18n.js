const fs = require("fs");
const path = require("path");

const srcPath =
    "v:/GameModding/Cities Skylines/CodedMods/Belzont/KlyteMods/BelzontTLM/_Frontends/UI/k45-xtm-vuio/src/components/glossary/glossaryContent.ts";
const src = fs.readFileSync(srcPath, "utf8");

const rows = [];
const seen = new Set();

function pushEntry(keySegment, en) {
    const fullKey = `glossary.${keySegment}`;
    if (seen.has(fullKey)) return;
    seen.add(fullKey);
    rows.push(
        [
            "K45::XTM",
            "vuio",
            "glossary",
            keySegment,
            `K45::XTM.vuio[${fullKey}]`,
            en,
            en,
        ].join("\t"),
    );
}

[
    ["toggleXtm", "XTM glossary"],
    ["title", "XTM Encyclopedia"],
    ["search.placeholder", "Search…"],
    ["packFilter", "Packs"],
    ["packFilter.all", "All packs"],
    ["tableOfContents", "Table of contents"],
    ["tab.all", "All"],
].forEach(([k, en]) => pushEntry(k, en));

const tabRe =
    /id:\s*"([^"]+)",\s*titleKey:\s*"([^"]+)",\s*titleFallback:\s*"([^"]+)"/g;
let m;
while ((m = tabRe.exec(src))) {
    pushEntry(m[2].replace(/^glossary\./, ""), m[3]);
}

const catRe = /category\(\s*"([^"]+)",\s*"([^"]+)"/g;
while ((m = catRe.exec(src))) {
    pushEntry(`category.${m[1]}`, m[2]);
}

const mdDir =
    "v:/GameModding/Cities Skylines/CodedMods/Belzont/KlyteMods/BelzontTLM/BelzontTLM/i18n/en-US";
fs.mkdirSync(mdDir, { recursive: true });

const secRe =
    /section\(\s*"([^"]+)",\s*"([^"]+)",\s*"((?:\\.|[^"\\])*)"\s*(?:,\s*[^)]*)?\)/g;
let mdCount = 0;
while ((m = secRe.exec(src))) {
    const id = m[1];
    const title = m[2];
    const body = m[3].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    pushEntry(`section.${id}`, title);
    const contentKey = `glossary.content.${id}`;
    const assembled = `K45::XTM.vuio[${contentKey}]`;
    const md = `---\nkey: ${assembled}\n---\n${body}\n`;
    fs.writeFileSync(path.join(mdDir, `${contentKey}.md`), md, "utf8");
    mdCount += 1;
}

const out =
    "v:/GameModding/Cities Skylines/CodedMods/Belzont/KlyteMods/BelzontTLM/BelzontTLM/i18n/glossary_entries.txt";
fs.writeFileSync(out, rows.join("\n") + "\n", "utf8");
console.log(`entries=${rows.length} md=${mdCount}`);
