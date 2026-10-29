import type { ReactNode } from "react";
import { useElementWidth } from "@/features/emotes/hooks/useElementWidth";
import { getVisibleRecentCount } from "@/features/emotes/utils/getVisibleRecentCount";
import type { ReactionBarItems } from "@/features/emotes/types/history";
import { ReactionBarItem } from "@/features/emotes/components/views/ReactionBarItem";
import { ReactionBarSeparator } from "@/features/emotes/components/views/ReactionBarSeparator";

type Props = {
    items: ReactionBarItems;
    onSelect: (emoji: string) => void;
    // The button that opens the full picker, after the recent reactions.
    more: ReactNode;
};

// The row of reactions that sits over the control bar, inside the same card:
// the fixed ones, the recent ones and the way to the full picker. The shortcut
// of each item is its place on the bar, from 1. In a narrow card the recent
// reactions give way first, from the last, and the keys still send them.
export const ReactionBar = ({ items, onSelect, more }: Props) => {
    const { fixed } = items;
    const { ref, width } = useElementWidth();
    const recents = items.recents.slice(
        0,
        getVisibleRecentCount(width, fixed.length)
    );

    return (
        <div
            ref={ref}
            className="flex items-center justify-between px-0.5 pt-0.5 pb-1"
        >
            {fixed.map((emoji, index) => (
                <ReactionBarItem
                    key={emoji}
                    emoji={emoji}
                    shortcut={String(index + 1)}
                    onSelect={onSelect}
                />
            ))}
            <ReactionBarSeparator visible={recents.length > 0} />
            {recents.map((emoji, index) => (
                <ReactionBarItem
                    key={emoji}
                    emoji={emoji}
                    shortcut={String(fixed.length + index + 1)}
                    onSelect={onSelect}
                />
            ))}
            {more}
        </div>
    );
};
