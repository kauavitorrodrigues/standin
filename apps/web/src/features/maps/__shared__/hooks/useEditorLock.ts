import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EDIT_SCOPES, LOCK_HEARTBEAT_MS } from "@standin/contracts";
import type {
    EditorAcquireAck,
    EditorLockLostReason,
    EditScopeKind,
} from "@standin/contracts";
import { realtimeSocket } from "@/features/realtime/socket";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import { LOCK_ACK_TIMEOUT_MS } from "@/features/maps/__shared__/consts/lock-recovery";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";
import { acquireEditorLock } from "@/features/maps/__shared__/utils/acquireEditorLock";
import { getLockStatus } from "@/features/maps/__shared__/utils/getLockStatus";

// Holds the editing lock of a map for as long as the editor is mounted: it
// acquires on mount, renews every LOCK_HEARTBEAT_MS and releases on unmount.
// The session id comes from the EditorStore, so the lock and the publish
// share one session per mount of the editor. `onAcquired` runs when the first
// answer grants the lock, before the status changes, so the caller can drop
// what it cached before it held the lock. The release goes out once: leaving
// by the button, by the exit dialog or by unmounting all end in the cleanup.
// The `mode` says what is being edited: the whole map (the Studio, the
// default) or only its objects (the decorator). `lostReason` tells why the
// lock was lost when the server said so, `MAP_EDITING` being the Studio that
// opened over a decorator.
export const useEditorLock = (
    mapId: string,
    sessionId: string,
    onAcquired?: () => void,
    mode: EditScopeKind = EDIT_SCOPES.MAP
) => {
    const [acquireAck, setAcquireAck] = useState<EditorAcquireAck | null>(null);
    const [lost, setLost] = useState(false);
    const [lostReason, setLostReason] = useState<EditorLockLostReason | null>(
        null
    );
    const releasedRef = useRef(true);
    const onAcquiredRef = useRef(onAcquired);

    useEffect(() => {
        onAcquiredRef.current = onAcquired;
    }, [onAcquired]);

    const lock = getLockStatus({ acquireAck, lost });
    const isHeld = lock.status === LOCK_STATUS.HELD;

    useEffect(() => {
        let active = true;
        const payload = { mapId, sessionId, mode };
        // Until the answer says otherwise the lock may be ours, so leaving
        // before it arrives still has to give it back.
        releasedRef.current = false;

        realtimeSocket.emit("editor:acquire", payload, (response) => {
            if (!active) return;
            if (response.ok) {
                onAcquiredRef.current?.();
            } else {
                releasedRef.current = true;
            }
            setAcquireAck(response);
        });

        return () => {
            active = false;
            if (releasedRef.current) return;
            releasedRef.current = true;
            realtimeSocket.emit("editor:release", payload, () => {});
        };
    }, [mapId, sessionId, mode]);

    useEffect(() => {
        if (!isHeld) return;

        const interval = setInterval(() => {
            realtimeSocket.emit(
                "editor:heartbeat",
                { mapId, sessionId, mode },
                (response) => {
                    if (!response.ok) setLost(true);
                }
            );
        }, LOCK_HEARTBEAT_MS);

        return () => clearInterval(interval);
    }, [isHeld, mapId, sessionId, mode]);

    useSocketEvent("editor:lock_lost", (payload) => {
        if (payload.mapId !== mapId) return;
        setLostReason(payload.reason ?? null);
        setLost(true);
    });

    const reacquire = useCallback(async () => {
        const ack = await acquireEditorLock(mapId, sessionId, mode);
        if (ack?.ok) releasedRef.current = false;
        return ack;
    }, [mapId, sessionId, mode]);

    const restore = useCallback(() => {
        setLostReason(null);
        setLost(false);
    }, []);

    const markLost = useCallback(() => setLost(true), []);

    // Resolves when the server answers, or when it stays silent for too long,
    // so the caller can go on to what needs the lock gone. Asking twice does
    // not release twice.
    const release = useCallback(
        () =>
            new Promise<void>((resolve) => {
                if (releasedRef.current) {
                    resolve();
                    return;
                }
                releasedRef.current = true;
                realtimeSocket
                    .timeout(LOCK_ACK_TIMEOUT_MS)
                    .emit("editor:release", { mapId, sessionId, mode }, () =>
                        resolve()
                    );
            }),
        [mapId, sessionId, mode]
    );

    const control = useMemo<EditorLockControl>(
        () => ({ reacquire, restore, markLost, release }),
        [reacquire, restore, markLost, release]
    );

    return { lock, control, lostReason };
};
