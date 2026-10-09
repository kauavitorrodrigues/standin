import type { StageTile } from "@/features/spaces/types/stage";
import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";
import { MediaControlGroup } from "@/features/spaces/components/pages/space-page/controls/MediaControlGroup";
import { NearbyPeople } from "@/features/spaces/components/pages/space-page/controls/NearbyPeople";

type Props = {
    tiles: StageTile[];
    media: SpaceMediaControls;
};

// Rendered at the bottom of the chat conversation list.
export const ChatFooter = ({ tiles, media }: Props) => (
    <>
        <NearbyPeople tiles={tiles} />
        <MediaControlGroup {...media} isMeetingContext={false} />
    </>
);
