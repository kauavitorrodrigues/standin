import { useAuth } from "@/features/auth/hooks/useAuth";
import { NearbyChatAnnouncer } from "@/features/nearby-chat/components/instances/NearbyChatAnnouncer";
import { NearbyChatPanel } from "@/features/nearby-chat/components/instances/NearbyChatPanel";
import { NearbyChatStrip } from "@/features/nearby-chat/components/instances/NearbyChatStrip";
import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";

type Props = {
    connection: NearbyChatConnection;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

// What the nearby chat adds to the top of the control card: the strip with the
// messages of the others while the panel is closed, and the panel itself.
export const NearbyChatLayer = ({
    connection,
    isOpen,
    onOpen,
    onClose,
}: Props) => {
    const { user } = useAuth();

    return (
        <>
            <NearbyChatAnnouncer connection={connection} selfUserId={user.id} />
            <NearbyChatStrip
                connection={connection}
                isPanelOpen={isOpen}
                onOpen={onOpen}
            />
            <NearbyChatPanel
                connection={connection}
                isOpen={isOpen}
                onClose={onClose}
            />
        </>
    );
};
