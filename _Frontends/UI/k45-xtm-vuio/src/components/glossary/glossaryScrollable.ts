import { ScrollableProps } from "cs2/ui";

/**
 * The vanilla glossary uses the new scrollbar style, and reserves the track on the
 * content pane. Neither prop is declared in the shipped cs2/ui typings.
 */
export const VANILLA_SCROLLABLE_PROPS = { useNewStyle: true } as unknown as ScrollableProps;

export const VANILLA_SCROLLABLE_RESERVE_PROPS = {
    useNewStyle: true,
    trackVisibility: "reserve",
} as unknown as ScrollableProps;
