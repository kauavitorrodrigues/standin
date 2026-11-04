import { socket } from "@/features/game/multiplayer/socket";
import { ANNOUNCING_ACK_TIMEOUT_MS } from "../consts/announcing";

// Rejects when the server does not answer in time.
export const emitSetAnnouncing = (announcing: boolean) =>
    socket
        .timeout(ANNOUNCING_ACK_TIMEOUT_MS)
        .emitWithAck("space:set-announcing", { announcing });
