import { socket } from "@/features/game/multiplayer/socket";
import { HAND_RAISE_ACK_TIMEOUT_MS } from "../consts/handRaise";

// Rejects when the server does not answer in time.
export const emitSetHandRaised = (raised: boolean) =>
    socket
        .timeout(HAND_RAISE_ACK_TIMEOUT_MS)
        .emitWithAck("space:set-hand-raised", { raised });
