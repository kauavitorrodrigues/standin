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
import type { SpaceSoundboard } from "@/features/soundboard/types/space";
import type { SoundboardPanelState } from "@/features/soundboard/hooks/useSoundboardPanel";
import { SoundboardControl } from "@/features/soundboard/components/instances/SoundboardControl";
import type { ReactionsButtonState } from "@/features/emotes/types/reactions";
import type { UserStatusPanelState } from "@/features/spaces/hooks/useUserStatusPanel";
import type { NearbyChatButtonState } from "@/features/nearby-chat/types/nearby-chat";
import { AnnounceButton } from "@/features/announcing/components/AnnounceButton";
import type { SpaceAnnouncing } from "@/features/announcing/types/announcing";
import { ReactionsControl } from "@/features/emotes/components/instances/ReactionsControl";
import { ProximityChatButton } from "@/features/spaces/components/pages/space-page/controls/ProximityChatButton";
import { LeaveSpaceButton } from "@/features/spaces/components/pages/space-page/controls/LeaveSpaceButton";

type Props = {
    // The screen share, the soundboard and the announcement only exist where
    // there is an office to meet people in. Over the chat the bar sits next to
    // the conversation and is narrow, so they would push the leave button out
    // of sight.
    isMeetingContext: boolean;
    canShareScreen: boolean;
    isSharingScreen: boolean;
    screenShareError: ScreenShareError | null;
    micError: LocalAudioStreamError | null;
    cameraError: LocalAudioStreamError | null;
    onStartScreenShare: () => void;
    onStopScreenShare: () => void;
    userStatus: UserStatusPanelState;
    reactions: ReactionsButtonState;
    nearbyChat: NearbyChatButtonState;
    soundboard: SpaceSoundboard | null;
    soundboardPanel: SoundboardPanelState;
    announcing: SpaceAnnouncing | null;
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
    userStatus,
    reactions,
    nearbyChat,
    soundboard,
    soundboardPanel,
    announcing,
}: Props) => {
    return (
        <TooltipProvider delay={SPACE_CONTROLS_TOOLTIP_DELAY_MS}>
            <UserWidget
                isOpen={userStatus.isOpen}
                onToggle={userStatus.onToggle}
            />
            <MicToggleButton error={micError} />
            <CameraToggleButton error={cameraError} />
            {isMeetingContext && (
                <SoundboardControl
                    soundboard={soundboard}
                    isOpen={soundboardPanel.isOpen}
                    onToggle={soundboardPanel.onToggle}
                />
            )}
            {isMeetingContext && <AnnounceButton announcing={announcing} />}
            <ReactionsControl {...reactions} />
            <ProximityChatButton {...nearbyChat} />
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
