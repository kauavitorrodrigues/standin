import { useRef, useState } from "react";
import { useEnterAnimation } from "@/features/game/hooks/useEnterAnimation";
import { getNearbyColor } from "@/features/game/utils/getNearbyColor";
import {
    NEARBY_CHAT_NAME_MAX_WIDTH,
    NEARBY_CHAT_ROW_ENTER_MS,
    NEARBY_CHAT_ROW_ENTER_OFFSET_Y,
} from "@/features/nearby-chat/consts/nearby-chat";
import { NearbyChatText } from "@/features/nearby-chat/components/views/NearbyChatText";
import type { NearbyLine } from "@/features/nearby-chat/utils/buildNearbyLines";

type Props = {
    line: NearbyLine;
    // A line that arrives while the list is on the screen rises in. The ones
    // that were already there when it opened do not.
    isNew?: boolean;
    // The line also grows from no height, which only makes sense when it makes
    // the list longer.
    grows?: boolean;
};

// One message of the list: the name with the color of the person, as in the
// bubble, and the text, which can be selected.
export const NearbyChatRow = ({
    line,
    isNew = false,
    grows = false,
}: Props) => {
    // Read once, when the line arrives. A later change of these must not play
    // the animation again.
    const [entry] = useState({ isNew, grows });
    const ref = useRef<HTMLDivElement | null>(null);
    useEnterAnimation(ref, {
        offsetY: NEARBY_CHAT_ROW_ENTER_OFFSET_Y,
        durationMs: NEARBY_CHAT_ROW_ENTER_MS,
        enabled: entry.isNew,
        grows: entry.grows,
    });

    return (
        <div
            ref={ref}
            role="listitem"
            className="flex items-baseline overflow-hidden gap-1.5 px-2 py-1 text-[13px] text-foreground select-text"
        >
            <span
                title={line.name}
                style={{
                    backgroundColor: getNearbyColor(line.senderId),
                    maxWidth: NEARBY_CHAT_NAME_MAX_WIDTH,
                }}
                className="shrink-0 truncate rounded px-1 text-xs font-medium text-neutral-900"
            >
                {line.name}
            </span>
            <NearbyChatText text={line.text} />
        </div>
    );
};
