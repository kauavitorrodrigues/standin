import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    SOUNDBOARD_COOLDOWN_MS,
    SOUNDBOARD_MAX_CONCURRENT_CLIPS,
} from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import { emitPlay } from "../lib/emitPlay";
import { emitStop } from "../lib/emitStop";
import { getClipBuffer } from "../lib/clipBufferCache";
import { onConnectionReset } from "../lib/onConnectionReset";
import { onStopped } from "../lib/onStopped";
import type { PlaysByPlayId } from "../types/playback";
import type { SpaceSoundboard, SpaceSoundboardOptions } from "../types/space";
import { collectClipIds } from "../utils/collectClipIds";
import { describePlayRefusal } from "../utils/describePlayRefusal";
import { isInsideCooldown } from "../utils/isInsideCooldown";
import { resolveDisabledReason } from "../utils/resolveDisabledReason";
import { stopsLocalPlay } from "../utils/stopsLocalPlay";
import { withoutPlay } from "../utils/withoutPlay";
import { withPlay } from "../utils/withPlay";

const NO_PLAYS: PlaysByPlayId = new Map();

/**
 * Plays soundboard clips into the call. The server decides who may play (the
 * wait between plays, how many at once), the clips themselves are mixed into
 * the microphone track on this side, and they overlap: every play has its own
 * id and ends on its own. The others hear them through the normal voice track.
 */
export function useSpaceSoundboard({
    player,
    micError,
    hasMicStream,
    isHeadphonesOn,
}: SpaceSoundboardOptions): SpaceSoundboard {
    const [plays, setPlays] = useState<PlaysByPlayId>(NO_PLAYS);
    // What the listeners read, since they live longer than a render.
    const playsRef = useRef<PlaysByPlayId>(NO_PLAYS);
    const lastPlayAtRef = useRef<number | null>(null);
    const playerRef = useRef(player);

    useEffect(() => {
        playerRef.current = player;
    }, [player]);

    const setOwnPlays = useCallback((next: PlaysByPlayId) => {
        playsRef.current = next;
        setPlays(next);
    }, []);

    useEffect(() => {
        const offStopped = onStopped((stopped) => {
            // Only a play of ours can be ended by the server.
            if (!stopsLocalPlay(stopped, playsRef.current)) return;
            playerRef.current.stopClip(stopped.playId);
            setOwnPlays(withoutPlay(playsRef.current, stopped.playId));
        });
        const offReset = onConnectionReset(() => {
            if (playsRef.current.size === 0) return;
            playerRef.current.stopAllClips();
            setOwnPlays(NO_PLAYS);
        });
        return () => {
            offStopped();
            offReset();
        };
    }, [setOwnPlays]);

    const disabledReason = resolveDisabledReason({
        micError,
        hasMicStream,
        isHeadphonesOn,
    });

    const endPlay = useCallback(
        (playId: string) => {
            setOwnPlays(withoutPlay(playsRef.current, playId));
            void emitStop(playId).catch(() => undefined);
        },
        [setOwnPlays]
    );

    const play = useCallback<SpaceSoundboard["play"]>(
        async (clip) => {
            if (disabledReason) return;
            // At the limit the buttons are disabled; this covers a click that
            // gets here before the screen shows it.
            if (playsRef.current.size >= SOUNDBOARD_MAX_CONCURRENT_CLIPS)
                return;
            const now = Date.now();
            // A click too soon after the last one is dropped, with no message.
            if (
                isInsideCooldown(
                    lastPlayAtRef.current,
                    now,
                    SOUNDBOARD_COOLDOWN_MS
                )
            ) {
                return;
            }
            lastPlayAtRef.current = now;

            try {
                // Decoded before asking, so the sound starts with the answer.
                const buffer = await getClipBuffer(clip);
                const ack = await emitPlay(clip.id);
                if (!ack.ok) {
                    const message = describePlayRefusal(ack);
                    if (message !== null) {
                        toast.add({ title: message, type: "error" });
                    }
                    return;
                }
                const { playId } = ack.clip;
                setOwnPlays(withPlay(playsRef.current, playId, clip.id));
                const started = playerRef.current.playClip({
                    playId,
                    buffer,
                    volume: clip.volume,
                    // It ran to its end by itself: tell the server which play.
                    onEnded: () => endPlay(playId),
                });
                if (!started) endPlay(playId);
            } catch {
                toast.add({
                    title: SOUNDBOARD_MESSAGES.PLAY_FAILED,
                    type: "error",
                });
            }
        },
        [disabledReason, endPlay, setOwnPlays]
    );

    const playingClipIds = useMemo(() => collectClipIds(plays), [plays]);
    const isAtLimit = plays.size >= SOUNDBOARD_MAX_CONCURRENT_CLIPS;

    return useMemo(
        () => ({ disabledReason, isAtLimit, playingClipIds, play }),
        [disabledReason, isAtLimit, playingClipIds, play]
    );
}
