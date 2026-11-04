import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { SpaceRaisedHand } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import { playHandRaiseSound } from "../lib/playHandRaiseSound";
import { HAND_RAISE_REQUESTS } from "../consts/handRaise";
import { emitSetHandRaised } from "../lib/emitSetHandRaised";
import type { HandRaiseRequestKind, SpaceHandRaise } from "../types/handRaise";
import {
    handRaiseReducer,
    INITIAL_HAND_RAISE_STATE,
} from "../utils/handRaiseState";
import { findNewHands } from "../utils/findNewHands";

const NO_HANDS: SpaceRaisedHand[] = [];

// Raising a hand to the people near me. The server keeps who has a hand up and
// who is within earshot of whom: the list that arrives is the whole truth, so
// it is shown as it is. My own state comes from the answer to my request.
export function useHandRaise(): SpaceHandRaise {
    const [state, dispatch] = useReducer(
        handRaiseReducer,
        INITIAL_HAND_RAISE_STATE
    );
    // What the listener reads, since it lives longer than a render.
    const handsRef = useRef<SpaceRaisedHand[]>(NO_HANDS);
    const isRequestPendingRef = useRef(false);

    const reset = useCallback(() => {
        handsRef.current = NO_HANDS;
        dispatch({ type: "reset" });
    }, []);

    useSocketEvent("space:raised-hands", ({ hands }) => {
        // A ding for a hand that just came up in earshot, never for the ones
        // already up, for the ones that went down, or for mine (it is not in
        // the list).
        if (findNewHands(handsRef.current, hands).length > 0)
            playHandRaiseSound();
        handsRef.current = hands;
        dispatch({ type: "hands-received", hands });
    });

    // The server presence is rebuilt on a join and on a reconnect, so every
    // hand is down afterwards, mine included.
    useSocketEvent("space:joined", reset);
    useEffect(() => {
        socket.on("disconnect", reset);
        socket.on("connect", reset);
        return () => {
            socket.off("disconnect", reset);
            socket.off("connect", reset);
        };
    }, [reset]);

    const request = useCallback(async (kind: HandRaiseRequestKind) => {
        if (isRequestPendingRef.current) return;

        isRequestPendingRef.current = true;
        const { raised, failedTitle } = HAND_RAISE_REQUESTS[kind];

        try {
            const ack = await emitSetHandRaised(raised);
            isRequestPendingRef.current = false;

            if (!ack.ok) {
                toast.add({ title: failedTitle, type: "error" });
                return;
            }

            dispatch({ type: "own-state-set", raisedSince: ack.raisedSince });
        } catch {
            isRequestPendingRef.current = false;
            toast.add({ title: failedTitle, type: "error" });
        }
    }, []);

    const raise = useCallback(() => void request("raise"), [request]);
    const lower = useCallback(() => void request("lower"), [request]);
    const isRaised = state.raisedSince !== null;

    return useMemo(
        () => ({ hands: state.hands, isRaised, raise, lower }),
        [state.hands, isRaised, raise, lower]
    );
}
