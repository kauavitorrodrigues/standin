import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { SpaceAnnouncer } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { socket } from "@/features/game/multiplayer/socket";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import { playNotificationSound } from "@/features/notifications/lib/playNotificationSound";
import {
    ANNOUNCING_REQUESTS,
    VIDEO_SHARING_FAILED_TITLES,
} from "../consts/announcing";
import { emitShareVideoWithAnnouncer } from "../lib/emitShareVideoWithAnnouncer";
import { emitSetAnnouncing } from "../lib/emitSetAnnouncing";
import type {
    AnnouncingRequestKind,
    SpaceAnnouncing,
    UseAnnouncingOptions,
} from "../types/announcing";
import {
    announcingReducer,
    INITIAL_ANNOUNCING_STATE,
} from "../utils/announcingState";
import { findNewAnnouncers } from "../utils/findNewAnnouncers";
import { shouldAutoStopVideoSharing } from "../utils/shouldAutoStopVideoSharing";
import { resolveVideoSharingKind } from "../utils/resolveVideoSharingKind";
import { resolveAnnounceDisabledReason } from "../utils/resolveAnnounceDisabledReason";
import { shouldAutoStopAnnouncing } from "../utils/shouldAutoStopAnnouncing";

const NO_ANNOUNCERS: SpaceAnnouncer[] = [];

// Announcing to the people near me. The server keeps who announces and who is
// within earshot of whom: the list that arrives is the whole truth, so it is
// shown as it is, never sorted, filtered or measured here. My own state comes
// from the answer to my request.
export function useAnnouncing({
    isMicEnabled,
    isCameraEnabled,
}: UseAnnouncingOptions): SpaceAnnouncing {
    const [state, dispatch] = useReducer(
        announcingReducer,
        INITIAL_ANNOUNCING_STATE
    );
    // What the listeners read, since they live longer than a render.
    const announcersRef = useRef<SpaceAnnouncer[]>(NO_ANNOUNCERS);
    const isRequestPendingRef = useRef(false);
    const isSharingRequestPendingRef = useRef(false);

    const reset = useCallback(() => {
        announcersRef.current = NO_ANNOUNCERS;
        dispatch({ type: "reset" });
    }, []);

    useSocketEvent("space:announcers", ({ announcers }) => {
        // A ding for someone who just came into earshot, never for the ones
        // already there, for who left, or for myself (I am not in the list).
        if (findNewAnnouncers(announcersRef.current, announcers).length > 0)
            playNotificationSound();
        announcersRef.current = announcers;
        dispatch({ type: "announcers-received", announcers });
    });

    // The server presence is rebuilt on a join and on a reconnect, so nobody
    // announces afterwards, me included.
    useSocketEvent("space:joined", reset);
    useEffect(() => {
        socket.on("disconnect", reset);
        socket.on("connect", reset);
        return () => {
            socket.off("disconnect", reset);
            socket.off("connect", reset);
        };
    }, [reset]);

    const request = useCallback(async (kind: AnnouncingRequestKind) => {
        if (isRequestPendingRef.current) return;

        isRequestPendingRef.current = true;
        const { announcing, failedTitle } = ANNOUNCING_REQUESTS[kind];

        try {
            const ack = await emitSetAnnouncing(announcing);
            isRequestPendingRef.current = false;

            if (!ack.ok) {
                toast.add({ title: failedTitle, type: "error" });
                return;
            }

            dispatch({
                type: "own-state-set",
                announcingSince: ack.announcingSince,
            });
        } catch {
            isRequestPendingRef.current = false;
            toast.add({ title: failedTitle, type: "error" });
        }
    }, []);

    const isSharingVideo = state.sharingVideoSince !== null;

    const toggleVideoSharing = useCallback(async () => {
        if (isSharingRequestPendingRef.current) return;

        isSharingRequestPendingRef.current = true;
        const wanted = !isSharingVideo;
        const failedTitle =
            VIDEO_SHARING_FAILED_TITLES[resolveVideoSharingKind(wanted)];

        try {
            const ack = await emitShareVideoWithAnnouncer(wanted);
            isSharingRequestPendingRef.current = false;

            if (!ack.ok) {
                toast.add({ title: failedTitle, type: "error" });
                return;
            }

            dispatch({
                type: "video-sharing-set",
                sharingVideoSince: ack.sharingSince,
            });
        } catch {
            isSharingRequestPendingRef.current = false;
            toast.add({ title: failedTitle, type: "error" });
        }
    }, [isSharingVideo]);

    useEffect(() => {
        if (
            !shouldAutoStopVideoSharing({
                isCameraEnabled,
                isSharingVideo,
                isRequestPending: isSharingRequestPendingRef.current,
            })
        ) {
            return;
        }

        void toggleVideoSharing();
    }, [isCameraEnabled, isSharingVideo, toggleVideoSharing]);

    const disabledReason = resolveAnnounceDisabledReason(isMicEnabled);
    const isAnnouncing = state.announcingSince !== null;

    const start = useCallback(() => {
        if (disabledReason !== null) return;
        void request("start");
    }, [disabledReason, request]);

    const stop = useCallback(() => void request("stop"), [request]);

    useEffect(() => {
        if (
            !shouldAutoStopAnnouncing({
                isMicEnabled,
                isAnnouncing,
                isRequestPending: isRequestPendingRef.current,
            })
        ) {
            return;
        }

        // Announcing never turns the microphone or the camera on by itself, so
        // there is nothing to turn back off here: only the announcement ends.
        stop();
    }, [isMicEnabled, isAnnouncing, stop]);

    return useMemo(
        () => ({
            announcers: state.announcers,
            isAnnouncing,
            isSharingVideo,
            canShareVideo: isCameraEnabled,
            disabledReason,
            start,
            stop,
            toggleVideoSharing: () => void toggleVideoSharing(),
        }),
        [
            state.announcers,
            isAnnouncing,
            isSharingVideo,
            isCameraEnabled,
            disabledReason,
            start,
            stop,
            toggleVideoSharing,
        ]
    );
}
