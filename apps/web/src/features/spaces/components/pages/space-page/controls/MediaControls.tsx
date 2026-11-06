import type { ScreenShareError } from "@/features/media-devices/consts/videoError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { PresenceSlot } from "@/components/ui/presence-slot";
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
import { AnnounceButton } from "@/features/spaces/announcing/components/AnnounceButton";
import type { SpaceAnnouncing } from "@/features/spaces/announcing/types/announcing";
import { HandRaiseButton } from "@/features/spaces/hand-raise/components/HandRaiseButton";
import type { SpaceHandRaise } from "@/features/spaces/hand-raise/types/handRaise";
import { ReactionsControl } from "@/features/emotes/components/instances/ReactionsControl";
import { ProximityChatButton } from "@/features/spaces/components/pages/space-page/controls/ProximityChatButton";
import { LeaveSpaceButton } from "@/features/spaces/components/pages/space-page/controls/LeaveSpaceButton";

type Props = {
    // The screen share, the soundboard, the announcement and the raised hand
    // only exist where there is an office to meet people in. Over the chat the
    // bar sits next to the conversation and is narrow, so they would push the
    // leave button out of sight.
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
    handRaise: SpaceHandRaise | null;
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
    handRaise,
}: Props) => {
    return (
        <TooltipProvider delay={SPACE_CONTROLS_TOOLTIP_DELAY_MS}>
            <UserWidget
                isOpen={userStatus.isOpen}
                onToggle={userStatus.onToggle}
            />
            <MicToggleButton error={micError} compact={!isMeetingContext} />
            <CameraToggleButton
                error={cameraError}
                compact={!isMeetingContext}
            />
            <PresenceSlot show={isMeetingContext && soundboard !== null}>
                <SoundboardControl
                    soundboard={soundboard}
                    isOpen={soundboardPanel.isOpen}
                    onToggle={soundboardPanel.onToggle}
                />
            </PresenceSlot>
            <PresenceSlot show={isMeetingContext && announcing !== null}>
                <AnnounceButton announcing={announcing} />
            </PresenceSlot>
            <ReactionsControl {...reactions} />
            <PresenceSlot show={isMeetingContext && handRaise !== null}>
                <HandRaiseButton handRaise={handRaise} />
            </PresenceSlot>
            <PresenceSlot show={nearbyChat.isEnabled}>
                <ProximityChatButton {...nearbyChat} />
            </PresenceSlot>
            <PresenceSlot show={isMeetingContext && canShareScreen}>
                <ScreenShareButton
                    visible
                    error={screenShareError}
                    onStart={onStartScreenShare}
                    onStop={onStopScreenShare}
                    isSharing={isSharingScreen}
                />
            </PresenceSlot>
            <Separator
                orientation="vertical"
                className="mx-1 my-1.5 h-auto self-stretch bg-border"
            />
            <LeaveSpaceButton />
        </TooltipProvider>
    );
};
