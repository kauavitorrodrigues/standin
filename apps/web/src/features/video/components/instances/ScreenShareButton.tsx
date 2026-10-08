import { MonitorOffIcon, MonitorUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SCREEN_SHARE_ERROR_LABEL } from "@/features/media-devices/consts/videoError";
import type { ScreenShareError } from "@/features/media-devices/consts/videoError";
import { SCREEN_SHARE_BUTTON_LABELS } from "../../consts/stage";

type ScreenShareButtonProps = {
    isSharing: boolean;
    // Nobody close enough to receive the share. The button stays in place
    // (so the bar does not shuffle as people come and go) but does nothing.
    disabled: boolean;
    error: ScreenShareError | null;
    onStart: () => void;
    onStop: () => void;
};

type TooltipInput = {
    error: ScreenShareError | null;
    disabled: boolean;
    label: string;
};

const resolveTooltip = ({ error, disabled, label }: TooltipInput): string => {
    if (error) return SCREEN_SHARE_ERROR_LABEL[error];
    if (disabled) return SCREEN_SHARE_BUTTON_LABELS.needsSomeoneNearby;
    return label;
};

type ClickHandlerInput = Pick<
    ScreenShareButtonProps,
    "disabled" | "isSharing" | "onStart" | "onStop"
>;

const resolveClickHandler = ({
    disabled,
    isSharing,
    onStart,
    onStop,
}: ClickHandlerInput): (() => void) | undefined => {
    if (disabled) return undefined;
    return isSharing ? onStop : onStart;
};

export const ScreenShareButton = ({
    isSharing,
    disabled,
    error,
    onStart,
    onStop,
}: ScreenShareButtonProps) => {
    const label = isSharing
        ? SCREEN_SHARE_BUTTON_LABELS.stop
        : SCREEN_SHARE_BUTTON_LABELS.start;
    const tooltip = resolveTooltip({ error, disabled, label });

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant={isSharing ? "default" : "outline"}
                        size="icon-lg"
                        aria-pressed={isSharing}
                        aria-label={label}
                        // aria-disabled rather than disabled: a disabled button
                        // gets no pointer events, so its tooltip would never
                        // explain why it is off.
                        aria-disabled={disabled}
                        className={disabled ? "opacity-50" : undefined}
                        onClick={resolveClickHandler({
                            disabled,
                            isSharing,
                            onStart,
                            onStop,
                        })}
                    />
                }
            >
                {isSharing ? <MonitorOffIcon /> : <MonitorUpIcon />}
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
};
