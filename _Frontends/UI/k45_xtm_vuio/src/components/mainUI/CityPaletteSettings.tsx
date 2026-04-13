import { TransportType } from "#enum/TransportType";
import { AutoColorService } from "#service/AutoColorService";
import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { VanillaWidgets, LocElementType } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { ObjectTyped } from "object-typed";
import { useState, useEffect } from "react";
import "./CityPaletteSettings.scss";

export function CityPaletteSettings(args: any) {

    const [availableCargo, setAvailableCargo] = useState<TransportType[]>([]);
    const [availablePalettes, setAvailablePalettes] = useState<Record<string, PaletteData>>({});
    const [availablePassenger, setAvailablePassenger] = useState<TransportType[]>([]);
    const [cargoSettings, setCargoSettings] = useState<Partial<Record<TransportType, string>>>({});
    const [passengerSettings, setPassengerSettings] = useState<Partial<Record<TransportType, string>>>({});

    function cargoNameFor(modal: TransportType) {
        return engine.translate(`Transport.ROUTES[${modal}]`);
    }
    function passengerNameFor(modal: TransportType) {
        return engine.translate(`Transport.LINES[${modal}]`);
    }


    useEffect(() => {
        engine.whenReady.then(async () => {
            reloadEverything();
            AutoColorService.doOnAutoColorSettingsChanged(() => reloadEverything());
            PaletteService.doOnCityPalettesUpdated(() => updatePalettes());
        });
    }, []);
    async function reloadEverything() {
        await updatePalettes();
        await AutoColorService.cargoModalAvailable().then(x => setAvailableCargo(x));
        await AutoColorService.passengerModalAvailable().then(x => setAvailablePassenger(x));
        await AutoColorService.passengerModalSettings().then(x => setPassengerSettings(x));
        await AutoColorService.cargoModalSettings().then(x => setCargoSettings(x));
    }
    async function updatePalettes() {
        const palettesSaved = await PaletteService.listCityPalettes();
        const defaultOptions = ([[void 0, { Name: translate("autoColorDisabled") } as PaletteData]] as [string | undefined, PaletteData][]);
        setAvailablePalettes(ObjectTyped.fromEntries(defaultOptions.concat(palettesSaved.sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" })).map(x => [x.GuidString, x])) as [string, PaletteData][]));
    }
    function setPassengerPaletteGuid(tt: TransportType, guid: string): void {
        AutoColorService.setModalAutoColor(tt, false, guid);
    }
    function setCargoPaletteGuid(tt: TransportType, guid: string): void {
        AutoColorService.setModalAutoColor(tt, true, guid);
    }

    const EditorItemRow = VanillaWidgets.instance.EditorItemRow;
    const StringDropdownField = VanillaWidgets.instance.DropdownField<string>();

    return <div className="k45_xtm_paletteSettings">
        <div className="k45_xtm_paletteSettings_passenger">
            <h4>{translate("palettesSettings.modalSettings")}</h4>
            {availablePassenger.map((tt, i) => {
                return <EditorItemRow label={passengerNameFor(tt)}>
                    <StringDropdownField items={Object.values(availablePalettes).map(x => ({
                        value: x.GuidString,
                        displayName: { value: x.Name, __Type: LocElementType.String },
                    }))} value={availablePalettes[passengerSettings[tt]!]?.GuidString} onChange={y => {
                        setPassengerPaletteGuid(tt, y);
                    }} />
                </EditorItemRow>;
            })}
        </div>
        <div className="k45_xtm_paletteSettings_cargo">
            <h4>{translate("palettesSettings.cargoModalsTitle")}</h4>
            {availableCargo.map((tt, i) => {
                return <EditorItemRow label={cargoNameFor(tt)}>
                    <StringDropdownField items={Object.values(availablePalettes).map(x => ({
                        value: x.GuidString,
                        displayName: { value: x.Name, __Type: LocElementType.String },
                    }))} value={availablePalettes[cargoSettings[tt]!]?.GuidString} onChange={y => {
                        setCargoPaletteGuid(tt, y);
                    }} />
                </EditorItemRow>;
            })}

        </div>
    </div>;
}
