
export enum NameType {
    Custom = "names.CustomName",
    Localized = "names.LocalizedName",
    Formatted = "names.FormattedName"
}

export type NameCustom = {
    __Type: NameType.Custom,
    name: string
}
export type NameLocalized = {
    __Type: NameType.Localized,
    nameId: string
}
export type NameFormatted = {
    __Type: NameType.Formatted,
    nameId: string,
    nameArgs?: Record<string, string>
}

export function nameToString(nameObj: NameCustom | NameFormatted | NameLocalized) {
    if (nameObj.__Type == NameType.Custom) {
        return nameObj.name;
    }
    var n = engine.translate(nameObj.nameId);
    if (n != null) {
        if (nameObj.__Type == NameType.Formatted) {
            var r = null != nameObj.nameArgs ? translateArgs(nameObj.nameArgs) : null;
            if (null != r) return replaceArgs(n, r)
        } return n
    } return nameObj.nameId
}
function translateArgs(nameArgs: Record<string, string>): Record<string, string> {
    return Object.entries(nameArgs).reduce((function (prev, current) {
        const key = current[0];
        const value = current[1];
        prev[key] = engine.translate(value) ?? value
        return prev;
    }), {});
}
export function replaceArgs(template: string, args: Record<string, string>) {
    return template.replace(/{((?!\d)[\w$]+)}/g, (function (original, n) {
        var replacement = args[n];
        return "string" == typeof replacement ? replacement : original
    }))
}
