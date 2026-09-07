import type { SeenByEntry } from "@standin/contracts";
import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";

type Props = {
    seenBy: SeenByEntry[];
    // Whether this conversation only ever has one other possible reader.
    // When true, naming them adds nothing. Only WHEN they read it matters.
    // When false (2+ possible readers), the reverse is true: WHO has read
    // it is the useful signal, not each one's timestamp.
    hasSingleViewer: boolean;
};

// Only rendered for the very last message in the conversation, and only
// when it's the current user's own message (see MessageLineContent).
// Showing "seen by" on someone else's message, or on an older message,
// wouldn't reflect anything meaningful.
//
// `seenBy` arrives ordered by readAt ascending (see listSeenBy).
const joinNames = (names: string[]) => {
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
};

export const MessageSeenByLabel = ({ seenBy, hasSingleViewer }: Props) => {
    if (seenBy.length === 0) return null;

    if (hasSingleViewer) {
        const lastViewer = seenBy[seenBy.length - 1];
        return (
            <p className="mt-1 text-xs text-muted-foreground">
                Visto às {formatMessageTime(lastViewer.readAt)}
            </p>
        );
    }

    return (
        <p className="mt-1 text-xs text-muted-foreground">
            Visto por {joinNames(seenBy.map((viewer) => viewer.name))}
        </p>
    );
};
