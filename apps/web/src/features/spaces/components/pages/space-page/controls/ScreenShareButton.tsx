import { MonitorOffIcon, MonitorUpIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SCREEN_SHARE_ERROR_LABEL } from "@/features/media-devices/consts/videoError";
import type { ScreenShareError } from "@/features/media-devices/consts/videoError";

type ScreenShareButtonProps = {
    // Sharing needs someone close enough to receive it, so the button is not
    // rendered otherwise. The caller keeps it visible while a share runs.
    visible: boolean;
    isSharing: boolean;
    error: ScreenShareError | null;
    onStart: () => void;
    onStop: () => void;
};

export const ScreenShareButton = ({
    visible,
    isSharing,
    error,
    onStart,
    onStop,
}: ScreenShareButtonProps) => {
    if (!visible) return null;

    const label = isSharing
        ? "Parar de compartilhar"
        : "Compartilhar tela";
    const tooltip = error ? SCREEN_SHARE_ERROR_LABEL[error] : label;

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <ControlButton
                        type="button"
                        variant={isSharing ? "default" : "ghost"}
                        aria-pressed={isSharing}
                        aria-label={label}
                        onClick={isSharing ? onStop : onStart}
                    />
                }
            >
                {isSharing ? <MonitorOffIcon /> : <MonitorUpIcon />}
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
};
