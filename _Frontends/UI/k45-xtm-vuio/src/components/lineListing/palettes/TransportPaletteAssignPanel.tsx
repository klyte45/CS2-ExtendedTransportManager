import { TransportType } from "#enum/TransportType";
import { AutoColorService } from "#service/AutoColorService";
import { PaletteData } from "#service/PaletteService";
import translate from "#utility/translate";
import {
    calculateElementPosition,
    ColorUtils,
    isOnArea,
    onRecalculateContextMenuPosition,
    VanillaWidgets,
} from "@klyte45/vuio-commons";
import { Portal, Tooltip } from "cs2/ui";
import engine from "cohtml/cohtml";
import classNames from "classnames";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { clampPalettePathDisplay } from "./paletteDisplayUtils";
import { getTransportTypeDefaultColor } from "./transportTypeColors";

type Props = {
    availablePalettes: PaletteData[];
};

function typeLabel(type: TransportType, isCargo: boolean): string {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

export function TransportPaletteAssignPanel({ availablePalettes }: Props) {
    const [passengerTypes, setPassengerTypes] = useState<TransportType[]>([]);
    const [cargoTypes, setCargoTypes] = useState<TransportType[]>([]);
    const [passengerSettings, setPassengerSettings] = useState<Partial<Record<TransportType, string>>>(
        {},
    );
    const [cargoSettings, setCargoSettings] = useState<Partial<Record<TransportType, string>>>({});
    const [typeColors, setTypeColors] = useState<Record<string, string>>({});

    const paletteByGuid = useMemo(() => {
        const map: Record<string, PaletteData> = {};
        for (const p of availablePalettes) map[p.GuidString] = p;
        return map;
    }, [availablePalettes]);

    const reload = async () => {
        const [passenger, cargo, pSettings, cSettings] = await Promise.all([
            AutoColorService.passengerModalAvailable(),
            AutoColorService.cargoModalAvailable(),
            AutoColorService.passengerModalSettings(),
            AutoColorService.cargoModalSettings(),
        ]);
        setPassengerTypes(passenger ?? []);
        setCargoTypes(cargo ?? []);
        setPassengerSettings(pSettings ?? {});
        setCargoSettings(cSettings ?? {});

        const colorEntries: [string, string][] = [];
        for (const t of passenger ?? []) {
            colorEntries.push([`${t}.false`, await getTransportTypeDefaultColor(t, false)]);
        }
        for (const t of cargo ?? []) {
            colorEntries.push([`${t}.true`, await getTransportTypeDefaultColor(t, true)]);
        }
        setTypeColors(Object.fromEntries(colorEntries));
    };

    useEffect(() => {
        void reload();
        AutoColorService.doOnAutoColorSettingsChanged(() => {
            void reload();
        });
    }, []);

    const setPalette = (type: TransportType, isCargo: boolean, guid: string) => {
        AutoColorService.setModalAutoColor(type, isCargo, guid);
    };

    return (
        <div className="xtm-paletteAssign">
            <AssignRow
                title={translate("palettes.section.passengers", "Passengers")}
                types={passengerTypes}
                isCargo={false}
                settings={passengerSettings}
                paletteByGuid={paletteByGuid}
                typeColors={typeColors}
                onSet={setPalette}
            />
            <AssignRow
                title={translate("palettes.section.cargo", "Cargo")}
                types={cargoTypes}
                isCargo={true}
                settings={cargoSettings}
                paletteByGuid={paletteByGuid}
                typeColors={typeColors}
                onSet={setPalette}
            />
        </div>
    );
}

function AssignRow({
    title,
    types,
    isCargo,
    settings,
    paletteByGuid,
    typeColors,
    onSet,
}: {
    title: string;
    types: TransportType[];
    isCargo: boolean;
    settings: Partial<Record<TransportType, string>>;
    paletteByGuid: Record<string, PaletteData>;
    typeColors: Record<string, string>;
    onSet: (type: TransportType, isCargo: boolean, guid: string) => void;
}) {
    return (
        <div className="xtm-paletteAssign_row">
            <div className="xtm-paletteAssign_rowTitle">{title}</div>
            <div className="xtm-paletteAssign_buttons">
                {types.map((tt) => (
                    <TypePaletteButton
                        key={`${tt}.${isCargo}`}
                        type={tt}
                        isCargo={isCargo}
                        selectedGuid={settings[tt]}
                        paletteByGuid={paletteByGuid}
                        bgColor={typeColors[`${tt}.${isCargo}`] ?? "#FF00FF"}
                        onSet={onSet}
                    />
                ))}
            </div>
        </div>
    );
}

function TypePaletteButton({
    type,
    isCargo,
    selectedGuid,
    paletteByGuid,
    bgColor,
    onSet,
}: {
    type: TransportType;
    isCargo: boolean;
    selectedGuid: string | undefined;
    paletteByGuid: Record<string, PaletteData>;
    bgColor: string;
    onSet: (type: TransportType, isCargo: boolean, guid: string) => void;
}) {
    const btnRef = useRef<HTMLDivElement>(null!);
    const menuRef = useRef<HTMLDivElement>(null!);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuCss, setMenuCss] = useState({} as CSSProperties);
    const EditorScrollable = VanillaWidgets.instance.EditorScrollable;
    const label = typeLabel(type, isCargo);
    const selectedPalette = selectedGuid ? paletteByGuid[selectedGuid] : undefined;
    const disabledLabel = translate("autoColorDisabled", "--Auto color disabled--");
    const valueFull = selectedPalette?.Name ?? disabledLabel;
    const valueClamped = selectedPalette
        ? clampPalettePathDisplay(selectedPalette.Name)
        : disabledLabel;
    const contrast = ColorUtils.toRGBA(
        ColorUtils.getContrastColorFor(ColorUtils.toColor01(bgColor as `#${string}`)),
    );

    const menuItems = useMemo(() => {
        const sorted = Object.values(paletteByGuid).sort((a, b) =>
            a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
        );
        return [
            { guid: "", name: disabledLabel },
            ...sorted.map((p) => ({ guid: p.GuidString, name: p.Name })),
        ];
    }, [paletteByGuid, disabledLabel]);

    useEffect(() => {
        if (!menuOpen || !btnRef.current) return;
        setMenuCss(
            onRecalculateContextMenuPosition(
                btnRef,
                calculateElementPosition(btnRef.current),
            ),
        );
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (isOnArea(event, btnRef)) return;
            if (isOnArea(event, menuRef)) return;
            setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [menuOpen]);

    const tooltip = (
        <div className="xtm-paletteAssign_tooltip">
            <div>{label}</div>
            <div>{valueFull}</div>
        </div>
    );

    return (
        <div className="xtm-paletteAssign_btnWrap" ref={btnRef}>
            <Tooltip tooltip={tooltip}>
                <button
                    type="button"
                    className="xtm-paletteAssign_btn txt"
                    style={
                        {
                            "--typeBtnBg": bgColor,
                            "--typeBtnFg": contrast,
                        } as CSSProperties
                    }
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span className="xtm-paletteAssign_btnType">{label}</span>
                    <span
                        className={classNames(
                            "xtm-paletteAssign_btnValue",
                            !selectedPalette && "muted",
                        )}
                    >
                        {valueClamped}
                    </span>
                </button>
            </Tooltip>
            {menuOpen && (
                <Portal>
                    <div
                        className={classNames("k45_comm_contextMenu", "xtm-popup-solid")}
                        style={menuCss}
                        ref={menuRef}
                    >
                        <div className="k45_comm_contextMenu_title">{label}</div>
                        <EditorScrollable style={{ maxHeight: "300rem" }}>
                            {menuItems.map((item) => {
                                const selected =
                                    (item.guid === "" && !selectedGuid) ||
                                    item.guid === selectedGuid;
                                return (
                                    <button
                                        key={item.guid || "__disabled"}
                                        type="button"
                                        className={classNames(
                                            "k45_comm_contextMenu_item",
                                            selected && "disabled",
                                        )}
                                        disabled={selected}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            if (!selected) onSet(type, isCargo, item.guid);
                                        }}
                                    >
                                        {`${selected ? "✓ " : ""}${item.name}`}
                                    </button>
                                );
                            })}
                        </EditorScrollable>
                    </div>
                </Portal>
            )}
        </div>
    );
}
