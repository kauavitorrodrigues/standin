import { useEffect, useRef, useState } from "react";
import { NEARBY_CHAT_TEXTS } from "@/features/nearby-chat/consts/nearby-chat";
import { NearbyChatRow } from "@/features/nearby-chat/components/views/NearbyChatRow";
import type { NearbyLine } from "@/features/nearby-chat/utils/buildNearbyLines";

type Props = { lines: readonly NearbyLine[] };

// The messages of the last minutes, the newest at the bottom. It is only there
// when there is something to show, and it scrolls to the end with each message.
export const NearbyChatList = ({ lines }: Props) => {
    const listRef = useRef<HTMLDivElement | null>(null);
    const lastId = lines.at(-1)?.id;
    // The lines of the first draw were there before, the next ones are new.
    const [initialIds] = useState(() => new Set(lines.map((line) => line.id)));
    // A line grows in only when the list gets longer. When the list is full the
    // oldest line leaves as the new one arrives, and growing it too would make
    // the panel shrink for a moment and then open again.
    const [tail, setTail] = useState({
        lastId,
        length: lines.length,
        previousLength: lines.length,
    });
    if (tail.lastId !== lastId) {
        setTail({
            lastId,
            length: lines.length,
            previousLength: tail.length,
        });
    }

    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [lastId]);

    if (lines.length === 0) return null;

    return (
        <div
            ref={listRef}
            role="list"
            aria-label={NEARBY_CHAT_TEXTS.LIST_LABEL}
            className="max-h-40 overflow-y-auto pt-2.5 pb-1"
        >
            {lines.map((line) => (
                <NearbyChatRow
                    key={line.id}
                    line={line}
                    isNew={!initialIds.has(line.id)}
                    grows={lines.length > tail.previousLength}
                />
            ))}
        </div>
    );
};
