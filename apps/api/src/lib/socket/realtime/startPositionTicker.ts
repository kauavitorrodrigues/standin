import { SPACE_TICK_MS, SpaceEvents } from "@standin/contracts";
import { SocketManager } from "../socketManager";
import { SpaceInterests } from "./SpaceInterests";

// Every tick, each person hears once what changed around them. A message that
// only moves people is volatile: a client that is behind drops it, and the next
// one carries the position that matters. A message that says someone came into
// sight or went out of it is reliable, because the client learns who that
// person is only from it, and a lost one would leave them undrawn for good.
// Returns stop(), used by tests and by the shutdown.
export const startPositionTicker = (
    intervalMs: number = SPACE_TICK_MS
): (() => void) => {
    const tick = () => {
        try {
            SpaceInterests.flushAll((_spaceId, socketId, payload) => {
                const changesSight =
                    payload.entered.length > 0 || payload.left.length > 0;
                if (changesSight) {
                    SocketManager.emitToSocket(
                        socketId,
                        SpaceEvents.SPACE_POSITIONS,
                        payload
                    );
                    return;
                }

                SocketManager.emitVolatileToSocket(
                    socketId,
                    SpaceEvents.SPACE_POSITIONS,
                    payload
                );
            });
        } catch (error) {
            console.error(error);
        }
    };

    const timer = setInterval(tick, intervalMs);
    timer.unref();

    return () => clearInterval(timer);
};
