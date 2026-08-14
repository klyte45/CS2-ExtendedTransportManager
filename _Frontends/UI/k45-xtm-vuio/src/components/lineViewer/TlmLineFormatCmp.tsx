import "#styles/TLM_FormatContainer.scss";
import { CSSProperties, memo, useEffect, useState } from "react";
import { TransportType } from "#enum/TransportType";
import {
    LineActivityClass,
} from "#components/mainWindow/mainWindowTypes";
import { ShieldImageService } from "#service/ShieldImageService";

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
    const [url, setUrl] = useState("");

    // Listing uses contentOverride (game icon) instead of text — bake empty label.
    const bakeText = contentOverride != null ? "" : (text ?? "");
    const activityKey = activity ?? "activity-dayNight";

    useEffect(() => {
        let cancelled = false;
        ShieldImageService.ensure({
            type,
            isCargo,
            color,
            text: bakeText,
            activity: activityKey,
            borderWidth,
        }).then((next) => {
            if (!cancelled && next) setUrl(next);
        }).catch(() => {
            /* keep prior url */
        });
        return () => { cancelled = true; };
    }, [type, isCargo, color, bakeText, activityKey, borderWidth]);

    const style: CSSProperties = url
        ? {
            backgroundImage: `url(${url})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
        }
        : {
            backgroundColor: color,
        };

    return (
        <div
            className={[className, "formatContainer", "formatContainer--baked"].filter(Boolean).join(" ")}
            style={style}
            onClick={onClick}
        >
            {contentOverride != null ? (
                <div className="formatBaked_overlay">{contentOverride}</div>
            ) : null}
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
