import type { EditorAcquireAck } from "@standin/contracts";
import { realtimeSocket } from "@/features/realtime/socket";
import { LOCK_ACK_TIMEOUT_MS } from "@/features/maps/__shared__/consts/lock-recovery";

// Asks for the lock and waits for the answer. It gives null when the server
// does not answer in time, so the caller can tell it from a refusal.
export const acquireEditorLock = (
    mapId: string,
    sessionId: string
): Promise<EditorAcquireAck | null> =>
    new Promise((resolve) => {
        realtimeSocket
            .timeout(LOCK_ACK_TIMEOUT_MS)
            .emit("editor:acquire", { mapId, sessionId }, (error, ack) => {
                resolve(error ? null : ack);
            });
    });
