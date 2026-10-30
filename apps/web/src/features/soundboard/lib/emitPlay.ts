import { socket } from "@/features/game/multiplayer/socket";
import { SOUNDBOARD_ACK_TIMEOUT_MS } from "../consts/socket";

export const emitPlay = (clipId: string) =>
    socket
        .timeout(SOUNDBOARD_ACK_TIMEOUT_MS)
        .emitWithAck("soundboard:play", { clipId });
