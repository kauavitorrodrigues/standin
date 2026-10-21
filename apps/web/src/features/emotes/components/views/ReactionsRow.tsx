import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import type { ReactionBarItems } from "@/features/emotes/types/history";
import { ReactionBar } from "@/features/emotes/components/views/ReactionBar";
import { MoreEmojisPopover } from "@/features/emotes/components/views/MoreEmojisPopover";

type Props = {
    isOpen: boolean;
    items: ReactionBarItems;
    onSelect: (emoji: string) => void;
};

// The reactions bar as the top row of the control card, so it grows out of the
// same card instead of floating over the map. It takes the width of the
// controls under it and never makes the card wider, so the emojis shrink to
// fit.
export const ReactionsRow = ({ isOpen, items, onSelect }: Props) => (
    <AnimatedCollapse open={isOpen} className="w-0 min-w-full">
        <ReactionBar
            items={items}
            onSelect={onSelect}
            more={<MoreEmojisPopover onSelect={onSelect} />}
        />
    </AnimatedCollapse>
);
