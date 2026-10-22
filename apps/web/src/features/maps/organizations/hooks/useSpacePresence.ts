import { useEffect } from "react";
import { socket } from "@/features/game/multiplayer/socket";
import { joinSpacePresence } from "../lib/joinSpacePresence";
import { shouldConnectPresence } from "../utils/shouldConnectPresence";
import type { PresenceTarget } from "../types/presenceTarget";
import type { PresenceSocket } from "../types/presenceSocket";

// Keeps the user present in the space while its map is edited. Listeners of
// the lock and publish events attach to the same shared socket.
export const useSpacePresence = (target: PresenceTarget) => {
    const { organizationId, spaceId, userId } = target;

    useEffect(() => {
        if (!organizationId || !spaceId || !userId) return;
        if (!shouldConnectPresence({ organizationId, spaceId, userId })) return;

        return joinSpacePresence({
            socket: socket as unknown as PresenceSocket,
            spaceId,
        });
    }, [organizationId, spaceId, userId]);
};
