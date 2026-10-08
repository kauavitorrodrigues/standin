import { VideoOffIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { LOCAL_CAMERA_ERROR_LABEL } from "@/features/media-devices/consts/videoError";

export const CameraUnavailableIndicator = ({
    error,
}: {
    error: LocalAudioStreamError;
}) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <span className="inline-flex items-center justify-center text-destructive" />
            }
        >
            <VideoOffIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>{LOCAL_CAMERA_ERROR_LABEL[error]}</TooltipContent>
    </Tooltip>
);
