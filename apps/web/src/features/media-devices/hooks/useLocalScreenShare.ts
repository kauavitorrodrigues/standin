import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenShareError } from "@/features/media-devices/consts/videoError";
import {
    getScreenAudioConstraints,
    getScreenCaptureConstraints,
    getScreenContentHint,
    getScreenTrackConstraints,
} from "@/features/media-devices/lib/screenConstraints";
import { screenShareSettingsPreference } from "@/features/media-devices/lib/streamingSettingsPreferences";
import { performanceOverrideStore } from "@/features/settings/performance/lib/performanceOverride";
import { classifyScreenShareError } from "@/features/media-devices/lib/classifyScreenShareError";

// Screen capture is always started by an explicit click (browsers require a
// user gesture for getDisplayMedia), so unlike the camera there is no
// preference to restore: it is off until start() is called.
export function useLocalScreenShare() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<ScreenShareError | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    // The browser's picker stays open until the person answers, so a capture
    // can be "in flight" for a long time. Two things follow from that: a
    // second click must not start another one, and the page may be gone by
    // the time the person finally picks something.
    const isPickingRef = useRef(false);
    const isMountedRef = useRef(true);

    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
    }, []);

    const start = useCallback(async () => {
        if (streamRef.current || isPickingRef.current) return;

        isPickingRef.current = true;
        setError(null);
        // Read when the share starts: a change in the settings applies to
        // the next share, not to the one already running.
        const settings = screenShareSettingsPreference.get();
        const hdAllowed = !performanceOverrideStore.get().hdScreenShareOff;

        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: getScreenCaptureConstraints(),
                // The sound is only asked for when the setting is on. The
                // browser still lets the person leave it out in its picker,
                // so the stream may come without an audio track.
                audio: settings.shareAudio ? getScreenAudioConstraints() : false,
            });

            // Left the page while the picker was open: nobody is going to
            // use this capture, and the browser's sharing indicator would
            // stay on for it.
            if (!isMountedRef.current) {
                displayStream.getTracks().forEach((track) => track.stop());
                return;
            }

            const track = displayStream.getVideoTracks()[0];
            if (!track) return;

            // The browser's own "Stop sharing" bar ends the track without
            // going through stop(), so the app state has to follow it. It is
            // attached before the await below so an end during it is seen.
            let endedEarly = false;
            track.addEventListener(
                "ended",
                () => {
                    endedEarly = true;
                    stop();
                },
                { once: true }
            );

            // The tier box and the frame rate are applied after the capture,
            // too. A browser that refuses them keeps the share
            // running at what it captured.
            await track
                .applyConstraints(getScreenTrackConstraints(settings, hdAllowed))
                .catch(() => undefined);

            // The page may have unmounted, or the person may have stopped
            // sharing, while the constraints were applying.
            if (!isMountedRef.current || endedEarly) {
                displayStream.getTracks().forEach((t) => t.stop());
                return;
            }

            // See getScreenContentHint for what each hint trades away.
            track.contentHint = getScreenContentHint(settings, hdAllowed);

            streamRef.current = displayStream;
            setStream(displayStream);
        } catch (err) {
            if (isMountedRef.current) setError(classifyScreenShareError(err));
        } finally {
            isPickingRef.current = false;
        }
    }, [stop]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, []);

    return { stream, isSharing: stream !== null, error, start, stop };
}
