import type { SpaceSetStatusInput } from "@standin/contracts";
import { socket } from "@/features/game/multiplayer/socket";
import { STATUS_ACK_TIMEOUT_MS } from "../consts/availability";

// Rejects when the server does not answer in time.
export const emitSetStatus = (status: SpaceSetStatusInput) =>
    socket
        .timeout(STATUS_ACK_TIMEOUT_MS)
        .emitWithAck("space:set-status", status);
