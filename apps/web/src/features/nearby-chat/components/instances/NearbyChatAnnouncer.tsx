import { useNearbyNames } from "@/features/nearby-chat/hooks/useNearbyNames";
import { useNearbySnapshot } from "@/features/nearby-chat/hooks/useNearbySnapshot";
import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";
import {
    buildNearbyLines,
    type NearbyLine,
} from "@/features/nearby-chat/utils/buildNearbyLines";

type Props = {
    connection: NearbyChatConnection;
    // The user id of the person, whose own messages are not read out.
    selfUserId: string;
};

// A polite live region that reads the newest message of someone else to screen
// readers. It changes only when a new message arrives, so a redraw never reads
// the same one twice.
export const NearbyChatAnnouncer = ({ connection, selfUserId }: Props) => {
    const { history } = useNearbySnapshot(connection.store);
    const names = useNearbyNames();
    const latest = buildNearbyLines(history, names)
        .filter((line) => line.senderId !== selfUserId)
        .at(-1);

    return (
        <div aria-live="polite" role="log" className="sr-only">
            <span key={latest?.id}>{formatAnnouncement(latest)}</span>
        </div>
    );
};

const formatAnnouncement = (line: NearbyLine | undefined): string => {
    if (!line) return "";

    return `${line.name}: ${line.text}`;
};
