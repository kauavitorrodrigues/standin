import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import { WEBSITE_PRESENCE_ACK_TIMEOUT_MS } from "../consts/presence";
import type { WebsiteViewersState } from "../types/viewers";
import {
    EMPTY_VIEWERS,
    applyActiveObject,
    applyObjectClosed,
    applyPeerLeft,
    replaceViewers,
} from "../utils/websiteViewers";

type Options = {
    // The object the local person has open, which the server is told about.
    activeObjectId: string | null;
    // Another person closed the object for everyone looking at it.
    onClosedByOther: (objectId: string, byUserId: string) => void;
};

// Who has which website object open. The server keeps it and tells the whole
// space; it never tells a connection about itself, so the local person is
// added by whoever lists the viewers. Every person loads the page in their
// own browser: this is only who is looking, not a shared session.
export const useWebsiteViewers = ({
    activeObjectId,
    onClosedByOther,
}: Options) => {
    const [viewers, setViewers] = useState<WebsiteViewersState>(EMPTY_VIEWERS);
    const activeRef = useRef(activeObjectId);
    // What the server was last told, so only a change is sent.
    const sentRef = useRef<string | null>(null);
    const onClosedRef = useRef(onClosedByOther);

    useEffect(() => {
        activeRef.current = activeObjectId;
        onClosedRef.current = onClosedByOther;
    }, [activeObjectId, onClosedByOther]);

    const sendActive = useCallback((objectId: string | null) => {
        sentRef.current = objectId;
        socket
            .timeout(WEBSITE_PRESENCE_ACK_TIMEOUT_MS)
            .emitWithAck("space:set-active-object", { objectId })
            .catch(() => undefined);
    }, []);

    // The object is told when it opens and when it closes. A request lost on
    // the way leaves others with an old picture until the next change.
    useEffect(() => {
        if (!socket.connected || sentRef.current === activeObjectId) return;
        sendActive(activeObjectId);
    }, [activeObjectId, sendActive]);

    // Leaving the page closes the object for the others.
    useEffect(
        () => () => {
            if (activeRef.current !== null && socket.connected) {
                socket.emit(
                    "space:set-active-object",
                    { objectId: null },
                    () => undefined
                );
            }
        },
        []
    );

    // The presence of the server is rebuilt on a join and on a reconnect, so
    // what the person has open is told again.
    useSocketEvent("space:joined", ({ activeObjects }) => {
        setViewers(replaceViewers(activeObjects));
        if (activeRef.current !== null) sendActive(activeRef.current);
    });
    useSocketEvent("space:active-object", (payload) =>
        setViewers((state) => applyActiveObject(state, payload))
    );
    useSocketEvent("space:peer-left", ({ socketId }) =>
        setViewers((state) => applyPeerLeft(state, socketId))
    );
    useSocketEvent("space:object-closed", ({ objectId, closedByUserId }) => {
        setViewers((state) => applyObjectClosed(state, objectId));
        if (activeRef.current === objectId) {
            onClosedRef.current(objectId, closedByUserId);
        }
    });
    useEffect(() => {
        const reset = () => setViewers(EMPTY_VIEWERS);
        socket.on("disconnect", reset);
        return () => {
            socket.off("disconnect", reset);
        };
    }, []);

    const closeForViewers = useCallback(
        async (objectId: string): Promise<boolean> => {
            try {
                const ack = await socket
                    .timeout(WEBSITE_PRESENCE_ACK_TIMEOUT_MS)
                    .emitWithAck("space:close-object-for-viewers", {
                        objectId,
                    });
                if (ack.ok) return true;
            } catch {
                // Handled below, like a refusal.
            }
            toast.add({
                title: "Não foi possível fechar para quem está vendo.",
                type: "error",
            });
            return false;
        },
        []
    );

    return { viewers, closeForViewers };
};
