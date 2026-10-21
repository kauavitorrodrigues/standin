import { useEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import { NEARBY_MESSAGE_MAX_LENGTH } from "@standin/contracts";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";
import {
    NEARBY_CHAT_SHAKE_MS,
    NEARBY_CHAT_SHAKE_OFFSETS,
    NEARBY_CHAT_TEXTS,
} from "@/features/nearby-chat/consts/nearby-chat";
import type { NearbyCounter } from "@/features/nearby-chat/types/nearby-chat";
import { getNearbyCounterTone } from "@/features/nearby-chat/utils/getNearbyCounterTone";

type Props = {
    counter: NearbyCounter;
    // Goes up when a text that is too long is sent, and the header shakes.
    shakeCount: number;
    onClose: () => void;
};

// The header of the panel: the title in the center, which gives way to the
// counter from 35 characters, and the button that closes it.
export const NearbyChatHeader = ({ counter, shakeCount, onClose }: Props) => {
    const headerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const header = headerRef.current;
        if (shakeCount === 0 || !header) return;
        // With reduced motion only the color of the counter says it.
        if (prefersReducedMotion() || typeof header.animate !== "function") {
            return;
        }

        header.animate(
            NEARBY_CHAT_SHAKE_OFFSETS.map((offset) => ({
                transform: `translateX(${offset}px)`,
            })),
            { duration: NEARBY_CHAT_SHAKE_MS }
        );
    }, [shakeCount]);

    return (
        <div
            ref={headerRef}
            className="grid h-[26px] grid-cols-[1fr_auto_1fr] items-center border-b border-foreground/10 px-2 text-xs text-muted-foreground"
        >
            <span />
            <NearbyChatTitle isHidden={counter.isVisible} />
            <NearbyChatCounter counter={counter} />
            <button
                type="button"
                aria-label={NEARBY_CHAT_TEXTS.CLOSE}
                onClick={onClose}
                className="col-start-3 row-start-1 flex size-[18px] items-center justify-self-end justify-center rounded-sm hover:text-foreground"
            >
                <XIcon className="size-3.5" />
            </button>
        </div>
    );
};

const NearbyChatTitle = ({ isHidden }: { isHidden: boolean }) => {
    if (isHidden) return null;

    return (
        <span className="col-start-2 row-start-1">
            {NEARBY_CHAT_TEXTS.TITLE}
        </span>
    );
};

const NearbyChatCounter = ({ counter }: { counter: NearbyCounter }) => {
    if (!counter.isVisible) return null;

    return (
        <span
            data-tone={getNearbyCounterTone(counter)}
            className="col-start-2 row-start-1 tabular-nums data-[tone=error]:text-destructive data-[tone=warning]:text-amber-500"
        >
            {counter.length}/{NEARBY_MESSAGE_MAX_LENGTH}
        </span>
    );
};
