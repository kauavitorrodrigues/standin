import type { KeyboardEvent } from "react";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { NEARBY_CHAT_TEXTS } from "@/features/nearby-chat/consts/nearby-chat";
import { NearbyChatRow } from "@/features/nearby-chat/components/views/NearbyChatRow";
import { useNearbyNames } from "@/features/nearby-chat/hooks/useNearbyNames";
import { useNearbySnapshot } from "@/features/nearby-chat/hooks/useNearbySnapshot";
import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";
import { buildNearbyLines } from "@/features/nearby-chat/utils/buildNearbyLines";

type Props = {
    connection: NearbyChatConnection;
    // The strip only shows while the panel is closed.
    isPanelOpen: boolean;
    onOpen: () => void;
};

// The messages of the others over the bar while the panel is closed, for a few
// seconds. Clicking it opens the panel.
export const NearbyChatStrip = ({ connection, isPanelOpen, onOpen }: Props) => {
    const { strip } = useNearbySnapshot(connection.store);
    const names = useNearbyNames();
    const lines = buildNearbyLines(strip, names);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        onOpen();
    };

    return (
        <AnimatedCollapse
            open={!isPanelOpen && lines.length > 0}
            className="w-0 min-w-full duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
            <div
                role="button"
                tabIndex={0}
                data-nearby-chat=""
                aria-label={NEARBY_CHAT_TEXTS.STRIP_LABEL}
                onClick={onOpen}
                onKeyDown={handleKeyDown}
                className="cursor-pointer pb-1"
            >
                <div role="list" className="py-0.5">
                    {lines.map((line) => (
                        <NearbyChatRow key={line.id} line={line} isNew />
                    ))}
                </div>
            </div>
        </AnimatedCollapse>
    );
};
