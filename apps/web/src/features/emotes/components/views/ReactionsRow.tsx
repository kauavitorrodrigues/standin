import { ControlsRow } from "@/features/spaces/components/pages/space-page/controls/ControlsRow";
import type { ReactionBarItems } from "@/features/emotes/types/history";
import { ReactionBar } from "@/features/emotes/components/views/ReactionBar";
import { MoreEmojisPopover } from "@/features/emotes/components/views/MoreEmojisPopover";

type Props = {
    isOpen: boolean;
    items: ReactionBarItems;
    onSelect: (emoji: string) => void;
};

// The reactions bar as the top row of the control card, so it grows out of the
// same card instead of floating over the map. The emojis shrink to fit the
// width of the controls under it.
export const ReactionsRow = ({ isOpen, items, onSelect }: Props) => (
    <ControlsRow isOpen={isOpen}>
        <ReactionBar
            items={items}
            onSelect={onSelect}
            more={<MoreEmojisPopover onSelect={onSelect} />}
        />
    </ControlsRow>
);
