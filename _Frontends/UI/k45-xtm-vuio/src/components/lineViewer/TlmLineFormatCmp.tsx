import "#styles/TLM_FormatContainer.scss";
import { CSSProperties, memo } from "react";
import { TransportType } from "#enum/TransportType";
import { ColorUtils } from "@klyte45/vuio-commons";
import {
    LineActivityClass,
    SCHEDULE_BADGE_BG,
} from "#components/lineListing/lineListingTypes";
import i_scheduleDay from "#images/i_scheduleDay.svg";
import i_scheduleNight from "#images/i_scheduleNight.svg";
import i_scheduleDisabled from "#images/i_scheduleDisabled.svg";
import fmt_hexagon from "#images/fmt_hexagon.svg";
import fmt_trapezoid from "#images/fmt_trapezoid.svg";
import fmt_circle from "#images/fmt_circle.svg";
import fmt_pentagon from "#images/fmt_pentagon.svg";
import fmt_cross from "#images/fmt_cross.svg";
import fmt_diamond from "#images/fmt_diamond.svg";

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

/** type.isCargo → shared white silhouette; omit = rectangle (no mask). */
const FORMAT_MASK_BY_KEY: Record<string, string> = {
    [`${TransportType.Bus}.false`]: fmt_hexagon,
    [`${TransportType.Tram}.false`]: fmt_trapezoid,
    [`${TransportType.Train}.false`]: fmt_circle,
    [`${TransportType.Train}.true`]: fmt_circle,
    [`${TransportType.Airplane}.false`]: fmt_pentagon,
    [`${TransportType.Airplane}.true`]: fmt_pentagon,
    [`${TransportType.Ship}.false`]: fmt_cross,
    [`${TransportType.Ship}.true`]: fmt_cross,
    [`${TransportType.Ferry}.false`]: fmt_diamond,
};

function resolveFormatMask(type: TransportType, isCargo: boolean): string | undefined {
    return FORMAT_MASK_BY_KEY[`${type}.${isCargo}`];
}

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

function TlmLineFormatCmpInner({
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
    const maskUrl = resolveFormatMask(type, isCargo);
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
                    ...(maskUrl ? { "--format-mask": `url(${maskUrl})` } : {}),
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

function formatPropsEqual(prev: Props, next: Props): boolean {
    return (
        prev.color === next.color
        && prev.strokeColor === next.strokeColor
        && prev.text === next.text
        && prev.type === next.type
        && prev.isCargo === next.isCargo
        && prev.contentOverride === next.contentOverride
        && prev.className === next.className
        && prev.borderWidth === next.borderWidth
        && prev.onClick === next.onClick
        && prev.activity === next.activity
    );
}

export const TlmLineFormatCmp = memo(TlmLineFormatCmpInner, formatPropsEqual);
