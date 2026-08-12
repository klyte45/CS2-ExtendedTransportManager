import "#styles/TLM_FormatContainer.scss";
import { CSSProperties } from "react";
import { TransportType } from "#enum/TransportType";
import { ColorUtils } from "@klyte45/vuio-commons";
import {
    LineActivityClass,
    SCHEDULE_BADGE_BG,
} from "#components/lineListing/lineListingTypes";
import i_scheduleDay from "#images/i_scheduleDay.svg";
import i_scheduleNight from "#images/i_scheduleNight.svg";
import i_scheduleDisabled from "#images/i_scheduleDisabled.svg";

type Props = {
    color: string;
    strokeColor?: string;
    text?: string;
    type: TransportType;
    isCargo: boolean;
    contentOverride?: JSX.Element | null;
    className?: string;
    borderWidth?: string;
    onClick?: () => void;
    /**
     * Optional scheduling status. Badge is shown only when not day/night (default).
     * Pass via getLineActivityClass({ active, schedule }).
     */
    activity?: LineActivityClass;
};

const SCHEDULE_BADGE_ICONS: Record<
    Exclude<LineActivityClass, "activity-dayNight">,
    string
> = {
    "activity-day": i_scheduleDay,
    "activity-night": i_scheduleNight,
    "activity-disabled": i_scheduleDisabled,
};

function ScheduleBadge({ activity }: { activity: LineActivityClass }) {
    if (activity === "activity-dayNight") return null;
    return (
        <div
            className={`scheduleMarker scheduleMarker--${activity}`}
            style={{ backgroundColor: SCHEDULE_BADGE_BG[activity] } as CSSProperties}
        >
            <div
                className={[
                    "scheduleMarker_icon",
                    activity === "activity-day" ? "scheduleMarker_icon--dark" : null,
                ].filter(Boolean).join(" ")}
                style={{ backgroundImage: `url(${SCHEDULE_BADGE_ICONS[activity]})` }}
            />
        </div>
    );
}

export function TlmLineFormatCmp({
    color,
    text,
    type,
    isCargo,
    contentOverride,
    className,
    borderWidth,
    onClick,
    activity,
}: Props) {
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(color)));
    return (
        <div
            className={[className, "formatContainer"].filter(Boolean).join(" ")}
            style={{ "--fontColor": fontColor } as CSSProperties}
            onClick={onClick}
        >
            <div
                style={{
                    "--currentBgColor": ColorUtils.getClampedColor(color),
                    "--form-border-width": borderWidth ?? "0",
                } as CSSProperties}
                className={`format ${type} ${isCargo ? "cargo" : "passengers"}`}
            >
                {borderWidth && <div className="before"></div>}
                <div className="after"></div>
            </div>
            <div className="num">
                {contentOverride ?? text}
            </div>
            <div className="cargoMarker">©</div>
            {activity != null && <ScheduleBadge activity={activity} />}
        </div>
    );
}
