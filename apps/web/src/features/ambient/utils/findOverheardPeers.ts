import type { OverheardPeersInput } from "@/features/ambient/types";
import { isInAmbientRing } from "./resolveAmbientVolume";

/**
 * The people whose conversation is overheard: in the ambient ring and
 * speaking. Socket ids, since that is what the avatars are keyed by.
 */
export const findOverheardPeers = ({
    distances,
    userIds,
    speakingUserIds,
    ...ring
}: OverheardPeersInput): Set<string> => {
    const overheard = new Set<string>();
    distances.forEach((distance, socketId) => {
        const userId = userIds.get(socketId);
        if (userId === undefined || !speakingUserIds.has(userId)) return;
        if (!isInAmbientRing({ ...ring, distance })) return;

        overheard.add(socketId);
    });
    return overheard;
};

/** The people overheard now who were not before: a conversation that started. */
export const findStartedConversations = (
    previous: ReadonlySet<string>,
    next: ReadonlySet<string>
): string[] => [...next].filter((socketId) => !previous.has(socketId));
