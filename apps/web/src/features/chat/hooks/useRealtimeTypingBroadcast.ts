import { useCallback, useContext } from "react";
import { ChatEvents } from "@standin/contracts";
import { OrganizationContext } from "@/features/organizations/hooks/useOrganization";
import { realtimeSocket } from "@/features/realtime/socket";

// Typing sent through the connection of the app, for a chat that is not inside
// a space and so has no connection of a space to send it through. The server
// takes the organization from here, since there is no space to take it from.
// Without an organization, or a connection, nothing is sent.
export const useRealtimeTypingBroadcast = () => {
    const organizationId =
        useContext(OrganizationContext)?.organization?.id ?? null;

    return useCallback(
        (conversationId: string, isTyping: boolean) => {
            if (!organizationId || !realtimeSocket.connected) return;
            realtimeSocket.emit(ChatEvents.TYPING, {
                conversationId,
                isTyping,
                organizationId,
            });
        },
        [organizationId]
    );
};
