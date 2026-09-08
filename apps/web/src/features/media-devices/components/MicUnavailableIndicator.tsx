import { MicOffIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    LOCAL_AUDIO_STREAM_ERROR_LABEL,
    type LocalAudioStreamError,
} from "@/features/media-devices/consts/audioError";

export const MicUnavailableIndicator = ({
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
            <MicOffIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>{LOCAL_AUDIO_STREAM_ERROR_LABEL[error]}</TooltipContent>
    </Tooltip>
);
