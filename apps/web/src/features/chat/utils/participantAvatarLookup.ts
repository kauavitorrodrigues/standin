import type { UserSummary } from "@standin/contracts";

// A `Map` built once per `participants` change, so TypingIndicator can look
// up each visible typer's avatar in O(1) instead of running its own
// `.find()` over the whole participant list for every one of them.
export const buildParticipantAvatarLookup = (
    participants: UserSummary[]
): Map<string, string | null> =>
    new Map(participants.map((participant) => [participant.id, participant.avatarUrl]));
