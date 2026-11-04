import { splitPeopleByPresence } from "@/features/spaces/utils/splitPeopleByPresence";
import type {
    MentionCandidate,
    MentionSource,
} from "@/features/chat/types/mention";

// Who the list offers for what was typed after the @: people in the space
// first, each group by name. Nobody mentions themselves.
export const buildMentionCandidates = ({
    members,
    onlineUserIds,
    selfUserId,
    query,
}: MentionSource & { query: string }): MentionCandidate[] => {
    const others = members.filter(({ id }) => id !== selfUserId);
    const { online, offline } = splitPeopleByPresence(
        others,
        onlineUserIds,
        query
    );
    return [
        ...online.map((user) => ({ user, isOnline: true })),
        ...offline.map((user) => ({ user, isOnline: false })),
    ];
};
