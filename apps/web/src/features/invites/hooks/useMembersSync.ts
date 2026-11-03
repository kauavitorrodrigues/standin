import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import {
    MEMBER_ENTRIES_QUERY_KEY,
    ORGANIZATION_INVITATIONS_QUERY_KEY,
} from "../consts/queryKeys";

// The owner reads the people and the invitations of the organization. They
// hear that someone joined or an invitation changed (made, cancelled, taken)
// and read both lists again, so no refresh of the page is needed.
export const useMembersSync = (organizationId: string) => {
    const queryClient = useQueryClient();

    useSocketEvent("organization:members-changed", (changed) => {
        if (changed.organizationId !== organizationId) return;
        for (const key of [
            MEMBER_ENTRIES_QUERY_KEY,
            ORGANIZATION_INVITATIONS_QUERY_KEY,
        ]) {
            queryClient.invalidateQueries({
                queryKey: [key, organizationId],
            });
        }
    });
};
