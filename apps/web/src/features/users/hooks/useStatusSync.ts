import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import { emitSetStatus } from "../lib/emitSetStatus";
import { keepUnlessExpired } from "../utils/customStatus";
import { announcedAvailability } from "../utils/userStatus";
import { useIdleDetection } from "./useIdleDetection";
import { useUserStatus } from "./useUserStatus";

/**
 * Keeps the server and the device in step with the status of the local person
 * while they are in a space: watches for inactivity, sends the status on the
 * join and on each change, and ends the custom status when its time is up.
 * The server keeps the status only in memory, so every join sends it again.
 */
export const useStatusSync = () => {
    useIdleDetection();
    const { status, customStatus, clearCustomStatus } = useUserStatus();
    const availability = announcedAvailability(status);

    // A join counts, since the presence of the server starts empty on each one.
    const [joins, setJoins] = useState(0);
    const isJoinedRef = useRef(false);

    useSocketEvent("space:joined", () => {
        isJoinedRef.current = true;
        setJoins((count) => count + 1);
    });

    useEffect(() => {
        const onDisconnect = () => {
            isJoinedRef.current = false;
        };
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    useEffect(() => {
        if (customStatus?.expiresAt == null) return;

        // The device may hold a status that ended while the person was away
        // from the space, since this timer only runs inside one.
        const remaining = customStatus.expiresAt - Date.now();
        if (remaining <= 0) {
            clearCustomStatus();
            return;
        }

        const timer = setTimeout(clearCustomStatus, remaining);
        return () => clearTimeout(timer);
    }, [customStatus, clearCustomStatus]);

    useEffect(() => {
        if (joins === 0 || !isJoinedRef.current) return;

        const send = async () => {
            try {
                // Never an ended status: the server would refuse it.
                const ack = await emitSetStatus({
                    availability,
                    customStatus: keepUnlessExpired(customStatus, Date.now()),
                });
                if (ack.ok) return;
            } catch {
                // The same message covers a refusal and a missing answer.
            }
            toast.add({
                title: "Não foi possível atualizar o seu status.",
                type: "error",
            });
        };
        void send();
    }, [joins, availability, customStatus]);
};
