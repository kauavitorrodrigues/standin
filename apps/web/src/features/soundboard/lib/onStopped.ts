import type { SoundboardStopped } from "@standin/contracts";
import { socket } from "@/features/game/multiplayer/socket";

export const onStopped = (
    listener: (event: SoundboardStopped) => void
): (() => void) => {
    socket.on("soundboard:stopped", listener);
    return () => socket.off("soundboard:stopped", listener);
};
