import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { MediaControls } from "@/features/spaces/components/pages/space-page/controls/MediaControls";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { useReactions } from "@/features/emotes/hooks/useReactions";
import { ReactionsRow } from "@/features/emotes/components/views/ReactionsRow";
import { NearbyChatLayer } from "@/features/nearby-chat/components/instances/NearbyChatLayer";
import { useNearbyChat } from "@/features/nearby-chat/hooks/useNearbyChat";
import { SoundboardRow } from "@/features/soundboard/components/instances/SoundboardRow";
import { useSoundboardPanel } from "@/features/soundboard/hooks/useSoundboardPanel";
import { UserStatusRow } from "@/features/spaces/components/pages/space-page/controls/UserStatusRow";
import { useUserStatusPanel } from "@/features/spaces/hooks/useUserStatusPanel";
import { useControlsView } from "@/features/spaces/hooks/useControlsView";
import { cn } from "@/lib/utils";

type Props = SpaceMediaControls & {
    isMeetingContext: boolean;
};

// The media controls in their own group, ready to drop into the floating bar
// or the chat footer. The reactions bar (office only) and the nearby chat panel
// are the top rows of the same card, and only one of them is open at a time.
// The nearby chat also works over the chat view: the message reaches whoever is
// nearby, it is only not drawn anywhere there.
export const MediaControlGroup = ({
    isMeetingContext,
    canShareScreen,
    screenShare,
    micError,
    cameraError,
    sendEmote,
    nearbyChat,
    soundboard,
}: Props) => {
    
    const controls = useControlsView();
    
    const reactions = useReactions({
        enabled: isMeetingContext,
        onSendEmote: sendEmote,
        controls,
    });
    
    const userStatus = useUserStatusPanel({ controls });
    const soundboardPanel = useSoundboardPanel({
        controls,
        enabled: soundboard !== null,
    });

    const nearby = useNearbyChat({
        enabled: nearbyChat.isEnabled,
        controls,
    });

    return (
        <LayoutPrimitive.ControlGroup
            className={cn(
                "flex-col items-stretch gap-0",
                nearby.isOpen && "rounded-b-[14px] bg-muted/85 backdrop-blur-md"
            )}
        >
            <NearbyChatLayer
                connection={nearbyChat}
                isOpen={nearby.isOpen}
                onOpen={nearby.open}
                onClose={nearby.close}
            />
            <UserStatusRow isOpen={userStatus.isOpen} />
            <SoundboardRow
                isOpen={soundboardPanel.isOpen}
                soundboard={soundboard}
            />
            <ReactionsRow
                isOpen={reactions.isOpen}
                items={reactions.items}
                onSelect={reactions.send}
            />
            <AnimatedCollapse
                open={!nearby.isOpen}
                className="duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
                <div className="flex items-center justify-center gap-1">
                    <MediaControls
                        isMeetingContext={isMeetingContext}
                        canShareScreen={canShareScreen}
                        isSharingScreen={screenShare.isSharing}
                        screenShareError={screenShare.error}
                        micError={micError}
                        cameraError={cameraError}
                        soundboard={soundboard}
                        soundboardPanel={soundboardPanel}
                        onStartScreenShare={screenShare.start}
                        onStopScreenShare={screenShare.stop}
                        userStatus={userStatus}
                        reactions={reactions}
                        nearbyChat={{
                            isEnabled: nearbyChat.isEnabled,
                            isOpen: nearby.isOpen,
                            onToggle: nearby.toggle,
                        }}
                    />
                </div>
            </AnimatedCollapse>
        </LayoutPrimitive.ControlGroup>
    );
};
