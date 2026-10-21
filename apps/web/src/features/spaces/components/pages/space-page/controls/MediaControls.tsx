import type { ScreenShareError } from "@/features/media-devices/consts/videoError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    CameraToggleButton,
    MicToggleButton,
} from "@/features/media-devices/components";
import { ScreenShareButton } from "@/features/spaces/components/pages/space-page/controls/ScreenShareButton";
import { UserWidget } from "@/features/users/components/UserWidget";
import { SPACE_CONTROLS_TOOLTIP_DELAY_MS } from "@/features/spaces/consts/controls";
import type { ReactionsButtonState } from "@/features/emotes/types/reactions";
import { ReactionsControl } from "@/features/emotes/components/instances/ReactionsControl";
import { ProximityChatButton } from "@/features/spaces/components/pages/space-page/controls/ProximityChatButton";
import { LeaveSpaceButton } from "@/features/spaces/components/pages/space-page/controls/LeaveSpaceButton";

type Props = {
    // The screen share and proximity chat controls only exist where there is
    // an office to meet people in. Over the chat they would only crowd the bar.
    isMeetingContext: boolean;
    canShareScreen: boolean;
    isSharingScreen: boolean;
    screenShareError: ScreenShareError | null;
    micError: LocalAudioStreamError | null;
    cameraError: LocalAudioStreamError | null;
    onStartScreenShare: () => void;
    onStopScreenShare: () => void;
    reactions: ReactionsButtonState;
};

// The media and presence controls. Rendered in the floating bar over the
// office and in the chat panel footer, never both at once, so the keyboard
// shortcuts of the buttons are only bound once.
export const MediaControls = ({
    isMeetingContext,
    canShareScreen,
    isSharingScreen,
    screenShareError,
    micError,
    cameraError,
    onStartScreenShare,
    onStopScreenShare,
    reactions,
}: Props) => {
    return (
        <TooltipProvider delay={SPACE_CONTROLS_TOOLTIP_DELAY_MS}>
            <UserWidget />
            <MicToggleButton error={micError} />
            <CameraToggleButton error={cameraError} />
            <ReactionsControl
                visible={isMeetingContext}
                {...reactions}
            />
            <ProximityChatButton visible={isMeetingContext} />
            <ScreenShareButton
                visible={isMeetingContext && canShareScreen}
                error={screenShareError}
                onStart={onStartScreenShare}
                onStop={onStopScreenShare}
                isSharing={isSharingScreen}
            />
            <Separator
                orientation="vertical"
                className="mx-1 my-1.5 h-auto self-stretch bg-border"
            />
            <LeaveSpaceButton />
        </TooltipProvider>
    );
};
