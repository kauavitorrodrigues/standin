import { socket } from "@/features/game/multiplayer/socket";
import { ANNOUNCING_ACK_TIMEOUT_MS } from "../consts/announcing";

// Rejects when the server does not answer in time.
export const emitShareVideoWithAnnouncer = (sharing: boolean) =>
    socket
        .timeout(ANNOUNCING_ACK_TIMEOUT_MS)
        .emitWithAck("space:share-video-with-announcer", { sharing });
