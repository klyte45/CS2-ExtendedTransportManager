import iconWhite from "#images/iconWhite.svg";
import { GlossaryCategoryDef, GlossarySectionDef, GlossaryTabDef } from "./glossaryTypes";

const ALL_TAB_ID = "all";

function section(
    id: string,
    titleFallback: string,
    contentFallback: string,
    tutorialId?: string,
): GlossarySectionDef {
    return {
        id,
        titleKey: `glossary.section.${id}`,
        titleFallback,
        contentKey: `glossary.content.${id}`,
        contentFallback,
        tutorialId,
    };
}

function category(
    id: string,
    titleFallback: string,
    sections: GlossarySectionDef[],
    opts?: { icon?: string; packs?: string[]; requiresWe?: boolean },
): GlossaryCategoryDef {
    return {
        id,
        titleKey: `glossary.category.${id}`,
        titleFallback,
        icon: opts?.icon,
        packs: opts?.packs ?? [],
        requiresWe: opts?.requiresWe,
        sections,
    };
}

/** Canonical tabs (excluding synthesized All). */
export const GLOSSARY_TABS: GlossaryTabDef[] = [
    {
        id: "start",
        titleKey: "glossary.tab.start",
        titleFallback: "Start Here",
        icon: "coui://uil/Colored/StarFilled.svg",
        categories: [
            category("start.overview", "Overview", [
                section(
                    "start.overview.whatAdds",
                    "What XTM adds",
                    "Extended Transport Manager (XTM) expands Cities: Skylines II public transport with richer line listing, occupancy insights, fare groups, vehicle model groups, color palettes, and an enhanced linear route map.\n\nUse this encyclopedia when you need a walkthrough of those tools without leaving the game.",
                ),
                section(
                    "start.overview.mainScreens",
                    "Main screens and the XTM toggle",
                    "XTM wraps several stock panels. The Transportation Overview gains an XTM listing mode, and this Encyclopedia gains an XTM mode via the button on the right of the window.\n\nToggle back to the vanilla view any time — the panel shell, close button, and focus behavior stay the same.",
                ),
                section(
                    "start.overview.linesVsCargo",
                    "Passenger lines versus cargo routes",
                    "XTM treats passenger **lines** and cargo **routes** as related but distinct. Filters, reports, palettes, and vehicle model groups often split passenger and cargo so you can manage them separately.\n\nWhere a control says “line” generically, check whether cargo routes are included in that screen.",
                ),
            ]),
            category("start.gettingAround", "Getting around", [
                section(
                    "start.gettingAround.overview",
                    "Transportation Overview",
                    "Open Transportation Overview to reach the XTM line listing, occupancy reports, fare groups, vehicle model groups, and city palettes.\n\nUse **Change mode** in the listing toolbar to switch between those screens without closing the panel.",
                ),
                section(
                    "start.gettingAround.sip",
                    "Selected Info Panel",
                    "Selecting a transport line, stop, or vehicle opens the Selected Info Panel. XTM replaces or extends several route sections — color, ticket price, vehicle selection, and Line Data — and adds Write Everywhere destination blinds when that mod is available.",
                ),
                section(
                    "start.gettingAround.linearMap",
                    "Linear map",
                    "On a selected line, switch from the vanilla route sketch to the XTM linear map for stops, distances, districts, interchanges, vehicles, crowding, and segment occupancy overlays.",
                ),
                section(
                    "start.gettingAround.editorPalettes",
                    "Editor palette tool",
                    "In the Asset Editor, an XTM toolbar tool can open the palettes dialog so you can maintain city palettes outside of a running city session (when that setting is enabled).",
                ),
            ]),
            category("start.settings", "Settings & support", [
                section(
                    "start.settings.uiDefaults",
                    "UI defaults",
                    "Mod options control whether Transportation Overview opens in XTM listing mode by default, and whether the Editor palette tool appears in the editor toolbar.",
                ),
                section(
                    "start.settings.logging",
                    "Logging and diagnostics",
                    "Logging level, stack traces, and error popups live in the mod options. Raise logging temporarily when reporting a bug, then return it to a quieter level for normal play.",
                ),
                section(
                    "start.settings.localization",
                    "Localization",
                    "XTM ships English strings by default. Locale CSV and markdown files can be reloaded from mod options after you edit translation files on disk.",
                ),
                section(
                    "start.settings.support",
                    "Support links",
                    "Mod options include shortcuts to the forum topic, GitHub repository, and log folder. Prefer those when asking for help so maintainers see the same build and logs you have.",
                ),
            ]),
        ],
    },
    {
        id: "lines",
        titleKey: "glossary.tab.lines",
        titleFallback: "Lines & Routes",
        icon: "coui://uil/Colored/ListView.svg",
        categories: [
            category("lines.listing", "Listing & filters", [
                section(
                    "lines.listing.modes",
                    "Transport modes",
                    "The listing shows every passenger line and cargo route currently in the city, grouped by transport type. Filter buttons hide types you are not interested in without deleting anything.",
                ),
                section(
                    "lines.listing.passengerCargo",
                    "Passenger and cargo filters",
                    "Quick filters can show only passenger lines or only cargo routes. Combine them with transport-type toggles when the city mixes both networks heavily.",
                ),
                section(
                    "lines.listing.serviceState",
                    "Service-state filters",
                    "Filter by day & night, day only, night only, or disabled. Disabled lines stay in the city but are easy to hide while you work on active service.",
                ),
                section(
                    "lines.listing.sorting",
                    "Sorting",
                    "Sort by internal route number, display identifier, length, historical usage, monthly passengers/cargo, or schedule state. Clicking the same key again reverses ascending/descending order.",
                ),
                section(
                    "lines.listing.cards",
                    "Reading line cards",
                    "Each card shows identity (shield, number, name), length, vehicle count, passenger/cargo volume, occupancy range, color, and schedule. Open the line’s Selected Info Panel from the card when you need detail tools.",
                ),
            ]),
            category("lines.identity", "Identity & appearance", [
                section(
                    "lines.identity.name",
                    "Line name",
                    "Rename a line from the listing or info panel. Generated names can include the display identifier when you use the game naming pattern with the route identifier token.",
                ),
                section(
                    "lines.identity.routeNumber",
                    "Internal route number",
                    "The **internal route number** is the numeric id the simulation uses. Palette auto-color indexes often derive from this value, so changing it can change automatic colors.",
                ),
                section(
                    "lines.identity.displayId",
                    "Display identifier",
                    "The **display identifier** (acronym) is the short text drawn on shields and used in naming. It overrides how the numeric route number appears to players without replacing the internal number.",
                ),
                section(
                    "lines.identity.shields",
                    "Shield shapes and badges",
                    "Shield shape follows transport type (for example hexagon for buses, circle for trains). Cargo routes show a cargo badge; schedule state can add day/night/disabled markers on the shield.",
                ),
                section(
                    "lines.identity.color",
                    "Fixed color versus palette color",
                    "A line can use a fixed color you pick, or follow the palette assigned to its transport type. Restoring palette control clears the fixed override so auto-coloring applies again.",
                ),
            ]),
            category("lines.scheduling", "Scheduling & actions", [
                section(
                    "lines.scheduling.dayNight",
                    "Day and night",
                    "Day & night service runs across the full schedule. Use it when the line should keep vehicles out regardless of time of day.",
                ),
                section(
                    "lines.scheduling.dayOnly",
                    "Day only",
                    "Day-only lines run during daytime hours and idle at night. Combine with night-only sibling lines when you want different daytime and nighttime fleets.",
                ),
                section(
                    "lines.scheduling.nightOnly",
                    "Night only",
                    "Night-only lines are the counterpart to day-only service. Listing filters and occupancy reports can isolate night lines when reviewing off-peak performance.",
                ),
                section(
                    "lines.scheduling.disabled",
                    "Disabled",
                    "Disabling a line keeps its path and settings but stops vehicles from running. Re-enable it when you are ready to restore service.",
                ),
                section(
                    "lines.scheduling.openDetails",
                    "Opening line details",
                    "From a listing card, open the line to focus the map and Selected Info Panel. That is the entry point for the linear map, fare/model group assignment, and Write Everywhere blinds.",
                ),
            ]),
            category("lines.stopOrder", "Stop order", [
                section(
                    "lines.stopOrder.firstStop",
                    "First stop",
                    "You can pick a stop to become the new first stop of the line. That reorders the sequence used by naming, blinds steps, and some map displays.",
                ),
                section(
                    "lines.stopOrder.symmetric",
                    "Symmetric routes",
                    "Symmetric (out-and-back) routes can show a half-trip view on the linear map. Opposite platforms are linked so you can jump between paired stops.",
                ),
                section(
                    "lines.stopOrder.opposite",
                    "Opposite platforms",
                    "When an inverse stop exists, XTM can select it from the stop info section. Use that to inspect the return direction without hunting the map.",
                ),
            ]),
        ],
    },
    {
        id: "map",
        titleKey: "glossary.tab.map",
        titleFallback: "Map & Network",
        icon: "coui://uil/Colored/MeasureEven.svg",
        categories: [
            category("map.linear", "XTM linear map", [
                section(
                    "map.linear.switch",
                    "Switching from vanilla",
                    "On the line visualizer, enable the XTM map button to replace the compact vanilla sketch with the detailed linear map. Disable it to return to the stock view.",
                ),
                section(
                    "map.linear.whiteBg",
                    "White background",
                    "A white background option improves contrast when capturing screenshots or reading dense stop labels over dark UI chrome.",
                ),
                section(
                    "map.linear.halfTrip",
                    "Half-trip mode",
                    "For symmetric lines, half-trip mode shows one direction of the out-and-back path so the strip is easier to read. Turn it off when you need the full loop.",
                ),
            ]),
            category("map.stops", "Stops & geography", [
                section(
                    "map.stops.names",
                    "Stop names and buildings",
                    "Stops show names and can select the attached building when one exists. That helps jump from the schematic map into the world object that hosts the platform.",
                ),
                section(
                    "map.stops.distances",
                    "Distances",
                    "Optional distance labels show spacing between consecutive stops. Use them to spot overly long gaps or clustered stops on the same corridor.",
                ),
                section(
                    "map.stops.districts",
                    "District boundaries",
                    "District borders drawn along the route show which neighborhoods the line serves. Outside connections appear where the line meets the city edge.",
                ),
                section(
                    "map.stops.outside",
                    "Outside connections",
                    "Outside connection markers highlight links beyond the playable city. Treat them as termini when planning express or regional service.",
                ),
            ]),
            category("map.interchanges", "Interchanges", [
                section(
                    "map.interchanges.connected",
                    "Connected lines",
                    "At each stop, XTM can list other lines that share the stop. That is the fastest way to see transfer opportunities on the schematic.",
                ),
                section(
                    "map.interchanges.select",
                    "Selecting linked routes",
                    "Click a connected line shield to select that route. The overview and info panel follow the new selection so you can hop between intersecting services.",
                ),
            ]),
            category("map.vehicles", "Vehicles", [
                section(
                    "map.vehicles.live",
                    "Live vehicle positions",
                    "When enabled, vehicles appear along the linear map at their current progress. Toggle them off if the strip feels crowded while editing stops.",
                ),
                section(
                    "map.vehicles.nextArrival",
                    "Next-arrival data",
                    "Stop detail can show the next arriving vehicle, remaining distance, and stops to go. Use it together with crowding indicators when diagnosing wait times.",
                ),
                section(
                    "map.vehicles.odometer",
                    "Odometer and maintenance",
                    "Vehicle info exposes odometer and maintenance interval context, including which vehicle is next due. Plan depot visits before breakdowns pile up.",
                ),
            ]),
            category("map.advanced", "Advanced line data", [
                section(
                    "map.advanced.demand",
                    "Waiting and loaded demand",
                    "Line Data summarizes passengers or cargo waiting at stops and already loaded on vehicles. Compare both when deciding whether to add vehicles or retime service.",
                ),
                section(
                    "map.advanced.lap",
                    "Full-lap estimate",
                    "The estimated full-lap duration is how long a vehicle needs to complete the route under current conditions. Pair it with vehicle count to reason about headways.",
                ),
                section(
                    "map.advanced.avgOccupancy",
                    "Average occupancy",
                    "Average vehicle occupancy and stop waiting averages sit beside the historical occupancy tools. They are snapshots for the current selection, not the city-wide report.",
                ),
            ]),
        ],
    },
    {
        id: "statistics",
        titleKey: "glossary.tab.statistics",
        titleFallback: "Statistics",
        icon: "coui://uil/Colored/Statistics.svg",
        categories: [
            category("statistics.occupancy", "Occupancy & crowding", [
                section(
                    "statistics.occupancy.concepts",
                    "Occupancy versus platform crowding",
                    "**Vehicle occupancy** measures how full vehicles are on segments over time. **Platform crowding** estimates how busy a stop is relative to its capacity.\n\nPassenger and cargo networks use the same tooling with different units. Historical buckets can be missing or stale until enough samples accumulate.",
                ),
                section(
                    "statistics.occupancy.howCalculated",
                    "How occupancy is calculated",
                    "XTM records occupancy after boarding events and stores peaks into six four-hour buckets plus current-hour and daily-average views. Listing “usage” sorting leans on historical peak behavior, while city rankings may use percentile summaries.\n\nMissing buckets are skipped internally; empty charts usually mean the line has not run long enough in that window.",
                ),
                section(
                    "statistics.occupancy.mapDisplay",
                    "Map display modes",
                    "On the linear map, choose current hour, daily average, or a fixed bucket (00–04 through 20–24). Segment labels help you read relative load along the corridor.",
                ),
                section(
                    "statistics.occupancy.segmentDetails",
                    "Segment details",
                    "Selecting a segment opens direction-aware history with a time chart and daily average. Use it to confirm whether a hotspot is peak-only or persistent.",
                ),
                section(
                    "statistics.occupancy.cityReports",
                    "City reports",
                    "City occupancy reports rank passenger or cargo lines and individual segments. Open a ranking column for drilldown, then sort ascending or descending to find extremes.",
                ),
                section(
                    "statistics.occupancy.listing",
                    "Listing integration",
                    "Line cards show a min–max occupancy range for the filtered context. Usage sorting reorders the listing by historical occupancy so overloaded lines float up quickly.",
                ),
            ]),
        ],
    },
    {
        id: "groups",
        titleKey: "glossary.tab.groups",
        titleFallback: "Fares & Vehicle Models",
        icon: "coui://uil/Colored/GenericVehicles.svg",
        categories: [
            category("groups.fareBasics", "Fare groups", [
                section(
                    "groups.fareBasics.create",
                    "Creating and deleting groups",
                    "Fare groups let many lines share one ticket policy. Create, rename, or delete groups from the Fare Groups screen in Transportation Overview.",
                ),
                section(
                    "groups.fareBasics.default",
                    "Default fare and free travel",
                    "Each group has a default fare. Set it to zero for free travel. Member lines adopt that fare unless an hour exception applies.",
                ),
            ]),
            category("groups.fareTime", "Time-based fares", [
                section(
                    "groups.fareTime.exceptions",
                    "Hour exceptions",
                    "Add hourly exceptions when peak or off-peak prices should differ. Ranges are inclusive; overlapping ranges are rejected so the schedule stays unambiguous.",
                ),
                section(
                    "groups.fareTime.preview",
                    "Fare schedule preview",
                    "The editor previews the effective fare across the day after exceptions are applied. Check the preview before assigning a large set of lines.",
                ),
            ]),
            category("groups.fareMembership", "Fare membership", [
                section(
                    "groups.fareMembership.assign",
                    "Assigning lines",
                    "Assign a line from the Selected Info Panel ticket section or add/remove members in the group editor. Moving a line between groups replaces its previous membership.",
                ),
                section(
                    "groups.fareMembership.shared",
                    "Shared-change warning",
                    "Editing a managed fare updates every member line. Confirm you intend a network-wide change before saving exceptions or the default fare.",
                ),
            ]),
            category("groups.modelBasics", "Model group basics", [
                section(
                    "groups.modelBasics.scope",
                    "Transport-type and cargo scope",
                    "Vehicle model groups are permanently scoped to a transport type and passenger/cargo flag. Create separate groups when the same mode needs different fleets for passenger and cargo.",
                ),
                section(
                    "groups.modelBasics.crud",
                    "Creating, renaming, deleting",
                    "Manage groups from the Vehicle Model Groups screen. Deleting a group detaches its lines so they return to ordinary vanilla model selection.",
                ),
            ]),
            category("groups.compositions", "Compositions", [
                section(
                    "groups.compositions.primary",
                    "Primary and secondary vehicles",
                    "Where the mode supports it, compositions list a primary (engine) and optional secondary (carriage) models. Multiple compositions act as an allowed set for member lines.",
                ),
                section(
                    "groups.compositions.duplicates",
                    "Duplicate prevention and limits",
                    "XTM blocks duplicate compositions and enforces practical limits so the allowed set stays maintainable. Sort the catalog by name, capacity, or length while building compositions.",
                ),
            ]),
            category("groups.modelMembership", "Model membership", [
                section(
                    "groups.modelMembership.assign",
                    "Assigning from a line or in bulk",
                    "Assign a group from the line’s vehicle section or add many lines at once in the group editor. Moving and removing works the same way as fare membership.",
                ),
            ]),
            category("groups.incompatibilities", "Incompatibilities", [
                section(
                    "groups.incompatibilities.external",
                    "External policy and model conflicts",
                    "Other mods or vanilla edits can fight XTM when they rewrite ticket prices or model selection buffers. XTM retries applying the group policy after external changes.\n\n> **Alert:** After repeated unresolved conflicts (around sixteen), XTM stops re-enforcing that group on the affected line. Clear the conflicting change, then re-assign or edit the group to resume enforcement.",
                ),
            ]),
        ],
    },
    {
        id: "appearance",
        titleKey: "glossary.tab.appearance",
        titleFallback: "Palettes & Integrations",
        icon: "coui://uil/Colored/ColorPalette.svg",
        categories: [
            category("appearance.library", "Palette library", [
                section(
                    "appearance.library.city",
                    "City palettes",
                    "City-owned palettes are saved with the city. Use them for the live auto-color assignments players see while playing.",
                ),
                section(
                    "appearance.library.default",
                    "Default library",
                    "Bundled default palettes provide a starting collection. Copy or append them into the city library instead of editing the defaults in place.",
                ),
                section(
                    "appearance.library.import",
                    "Importing .hex files",
                    "Import `.hex` palette files from disk through the file picker. Starting in the mod palette folder keeps navigation near the files you already maintain.",
                ),
                section(
                    "appearance.library.editor",
                    "Editor-mode access",
                    "When enabled in options, the Asset Editor exposes an XTM tool that opens the same palettes dialog for offline editing.",
                ),
            ]),
            category("appearance.editing", "Palette editing", [
                section(
                    "appearance.editing.colors",
                    "Add and reorder colors",
                    "Add colors with the picker, drag to reorder, and shuffle when you want a fresh sequence. Reset discards unsaved edits; save writes them to the city library.",
                ),
                section(
                    "appearance.editing.clipboard",
                    "Copy, paste, replace, append",
                    "Copy an entire palette or paste colors with replace or append behavior. Palettes cap at 500 colors to keep auto-color indexes predictable.",
                ),
            ]),
            category("appearance.autoColor", "Automatic coloring", [
                section(
                    "appearance.autoColor.assign",
                    "Assign palette by transport type",
                    "Assign separate palettes for passenger and cargo transport types. Disable auto-color per type when you want only manual colors for that mode.",
                ),
                section(
                    "appearance.autoColor.indexing",
                    "Number-based indexing",
                    "Automatic colors typically index into the palette using the internal route number. Fixed-color exceptions on individual lines override the palette until restored.",
                ),
            ]),
            category(
                "appearance.we",
                "Write Everywhere",
                [
                    section(
                        "appearance.we.availability",
                        "Availability",
                        "Destination blinds appear only when Write Everywhere is installed and detected. Without it, this category is hidden from the encyclopedia tree.",
                    ),
                    section(
                        "appearance.we.steps",
                        "Steps and destination stops",
                        "A blind is a sequence of steps. Each step runs until a chosen stop (or the end of the line) and can contain multiple animated keyframes.",
                    ),
                    section(
                        "appearance.we.keyframes",
                        "Dynamic and static keyframes",
                        "Keyframes can show route name, stop/entity name, route number/identifier, fixed text, next stop, or entity-or-district text. Pick one keyframe as the static destination when a vehicle needs a non-animated blind.",
                    ),
                    section(
                        "appearance.we.extras",
                        "Prefixes, suffixes, and clipboard",
                        "Add prefix/suffix text and frame durations per keyframe. Reset to generated defaults, or copy/paste whole blind configurations between lines.",
                    ),
                ],
                { requiresWe: true },
            ),
        ],
    },
];

export function getGlossaryTabs(options?: { weAvailable?: boolean }): GlossaryTabDef[] {
    const weAvailable = options?.weAvailable !== false;
    const filterCategory = (cat: GlossaryCategoryDef) => !cat.requiresWe || weAvailable;

    const canonical = GLOSSARY_TABS.map((tab) => ({
        ...tab,
        categories: tab.categories.filter(filterCategory),
    })).filter((tab) => tab.categories.length > 0);

    const allCategories = canonical.flatMap((tab) => tab.categories);
    const allTab: GlossaryTabDef = {
        id: ALL_TAB_ID,
        titleKey: "glossary.tab.all",
        titleFallback: "All",
        icon: iconWhite,
        categories: allCategories,
    };

    return [allTab, ...canonical];
}

export { ALL_TAB_ID };
