import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { NearbyChatForm } from "@/features/nearby-chat/components/forms/NearbyChatForm";
import { NearbyChatHeader } from "@/features/nearby-chat/components/views/NearbyChatHeader";
import { NearbyChatList } from "@/features/nearby-chat/components/views/NearbyChatList";
import { useNearbyComposer } from "@/features/nearby-chat/hooks/useNearbyComposer";
import { useNearbyNames } from "@/features/nearby-chat/hooks/useNearbyNames";
import { useNearbySnapshot } from "@/features/nearby-chat/hooks/useNearbySnapshot";
import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";
import { buildNearbyLines } from "@/features/nearby-chat/utils/buildNearbyLines";

type Props = {
    connection: NearbyChatConnection;
    isOpen: boolean;
    onClose: () => void;
};

// The panel that takes the place of the buttons of the bar while it is open. It
// stays mounted when closed, so what was typed and the list are still there
// when it opens again. Taking the width of the bar, it never makes it wider.
export const NearbyChatPanel = ({ connection, isOpen, onClose }: Props) => {
    const { history } = useNearbySnapshot(connection.store);
    const names = useNearbyNames();
    const composer = useNearbyComposer({
        isOpen,
        onSend: connection.sendMessage,
        onTyping: connection.sendTyping,
    });

    return (
        <AnimatedCollapse
            open={isOpen}
            className="w-0 min-w-full duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
            <div data-nearby-chat="">
                <NearbyChatHeader
                    counter={composer.counter}
                    shakeCount={composer.shakeCount}
                    onClose={onClose}
                />
                <NearbyChatList lines={buildNearbyLines(history, names)} />
                <NearbyChatForm composer={composer} isOpen={isOpen} />
            </div>
        </AnimatedCollapse>
    );
};
