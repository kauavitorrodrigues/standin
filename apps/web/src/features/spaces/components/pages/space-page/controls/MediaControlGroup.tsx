import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { MediaControls } from "@/features/spaces/components/pages/space-page/controls/MediaControls";

type Props = SpaceMediaControls & {
    isMeetingContext: boolean;
};

// The media controls in their own group, ready to drop into the floating bar
// or the chat footer.
export const MediaControlGroup = ({
    isMeetingContext,
    canShareScreen,
    screenShare,
    micError,
    cameraError,
}: Props) => (
    <LayoutPrimitive.ControlGroup>
        <MediaControls
            isMeetingContext={isMeetingContext}
            canShareScreen={canShareScreen}
            isSharingScreen={screenShare.isSharing}
            screenShareError={screenShare.error}
            micError={micError}
            cameraError={cameraError}
            onStartScreenShare={screenShare.start}
            onStopScreenShare={screenShare.stop}
        />
    </LayoutPrimitive.ControlGroup>
);
