import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { useCallback } from "react";

export function XtmGlossarySearch({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const { SearchField, searchFieldGlossaryTheme, glossaryPanelTheme } = VanillaComponentResolver.instance;

    const onSearchChange = useCallback((next: string) => {
        onChange(next.replace(/[^a-zA-Z0-9\s,.'\u0100-\uffff]/g, ""));
    }, [onChange]);

    return (
        <div className={glossaryPanelTheme.searchBar}>
            <SearchField
                value={value}
                onChange={onSearchChange}
                theme={searchFieldGlossaryTheme}
                placeholder={translate("glossary.search.placeholder", "Search…")}
            />
        </div>
    );
}
