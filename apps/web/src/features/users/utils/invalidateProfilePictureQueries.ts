import type { QueryClient } from "@tanstack/react-query";
import {
    CONVERSATION_MESSAGES_QUERY_KEY,
    CONVERSATIONS_QUERY_KEY,
} from "@/features/chat/queries/queryKey";
import { CONVERSATION_PARTICIPANTS_QUERY_KEY } from "@/features/chat/queries/useParticipants";
import { ORGANIZATION_MEMBERS_QUERY_KEY } from "@/features/organizations/queries/members";

// Everything that draws the picture of a person from the server: the members
// of the organization (lists, online people), the messages, the conversations
// and their participants.
const PROFILE_PICTURE_QUERY_KEYS = [
    ORGANIZATION_MEMBERS_QUERY_KEY,
    CONVERSATION_MESSAGES_QUERY_KEY,
    CONVERSATIONS_QUERY_KEY,
    CONVERSATION_PARTICIPANTS_QUERY_KEY,
] as const;

/** Reloads the queries above, after the picture of someone changed. */
export const invalidateProfilePictureQueries = (
    queryClient: QueryClient
): Promise<void[]> =>
    Promise.all(
        PROFILE_PICTURE_QUERY_KEYS.map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
        )
    );
