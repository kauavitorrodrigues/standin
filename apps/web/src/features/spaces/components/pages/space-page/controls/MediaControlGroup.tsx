import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { MediaControls } from "@/features/spaces/components/pages/space-page/controls/MediaControls";
import { useReactions } from "@/features/emotes/hooks/useReactions";
import { ReactionsRow } from "@/features/emotes/components/views/ReactionsRow";

type Props = SpaceMediaControls & {
    isMeetingContext: boolean;
};

// The media controls in their own group, ready to drop into the floating bar
// or the chat footer. The reactions bar is the top row of the same card.
export const MediaControlGroup = ({
    isMeetingContext,
    canShareScreen,
    screenShare,
    micError,
    cameraError,
    sendEmote,
}: Props) => {
    const reactions = useReactions({
        enabled: isMeetingContext,
        onSendEmote: sendEmote,
    });

    return (
        <LayoutPrimitive.ControlGroup className="flex-col items-stretch gap-0">
            <ReactionsRow
                isOpen={reactions.isOpen}
                items={reactions.items}
                onSelect={reactions.send}
            />
            <div className="flex items-center justify-center gap-1">
                <MediaControls
                    isMeetingContext={isMeetingContext}
                    canShareScreen={canShareScreen}
                    isSharingScreen={screenShare.isSharing}
                    screenShareError={screenShare.error}
                    micError={micError}
                    cameraError={cameraError}
                    onStartScreenShare={screenShare.start}
                    onStopScreenShare={screenShare.stop}
                    reactions={reactions}
                />
            </div>
        </LayoutPrimitive.ControlGroup>
    );
};
