import { socket } from "@/features/game/multiplayer/socket";
import { SOUNDBOARD_ACK_TIMEOUT_MS } from "../consts/socket";

// Names the play, so a clip that plays twice is stopped one play at a time.
export const emitStop = (playId: string) =>
    socket
        .timeout(SOUNDBOARD_ACK_TIMEOUT_MS)
        .emitWithAck("soundboard:stop", { playId });
