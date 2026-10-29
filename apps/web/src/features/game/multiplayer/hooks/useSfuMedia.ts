import { useCallback, useMemo, useRef } from "react";
import { connectionReporter, socket } from "../socket";
import { SfuClient } from "../lib/SfuClient";
import { SfuSupervisor } from "../lib/SfuSupervisor";
import type { TransportErrorType } from "../lib/TransportConnectionMonitor";
import type { MediaView } from "../types/mediaView";
import type { SfuSocket } from "../types/sfuSignal";
import type { UseSfuMediaOptions } from "../types/sfuHooks";
import { createSfuSignal } from "../utils/createSfuSignal";
import { startCpuReading } from "../utils/startCpuReading";
import { useSfuLocalTracks } from "./useSfuLocalTracks";
import { useSfuRemoteMedia } from "./useSfuRemoteMedia";
import { useSfuSocketEvents } from "./useSfuSocketEvents";

/**
 * Everything the browser does with the media server during one stay in a
 * space. It is the one hook the rest of the game talks to, and it only
 * composes smaller pieces:
 * - `useSfuLocalTracks` sends the microphone, the camera and the screen,
 * - `useSfuRemoteMedia` plays what the server sends and shows who speaks,
 * - `useSfuSocketEvents` listens to what the server says,
 * - `startCpuReading` ties the session to the degradation of the machine.
 *
 * `beginSession` is called when the join answers and `endSession` when the stay
 * ends. The session itself is kept alive by {@link SfuSupervisor}.
 */
export function useSfuMedia({
    userId,
    remoteAudioManager,
    getSocketIdOfUser,
    localAudioTrack,
    localCameraTrack,
    localScreenTrack,
    isMicEnabled,
    isHeadphonesOn,
    isFocusModeOn,
    setUserSpeaking,
    setRemoteMicMuted,
    setRemotePrivacy,
}: UseSfuMediaOptions) {
    const supervisorRef = useRef<SfuSupervisor | null>(null);
    const stopCpuReadingRef = useRef<(() => void) | null>(null);

    const remote = useSfuRemoteMedia({
        userId,
        remoteAudioManager,
        getSocketIdOfUser,
        setUserSpeaking,
    });
    
    const { playRemote, stopRemote, stopAllRemote, applySpeakers } = remote;

    const latestRef = useSfuLocalTracks(supervisorRef, {
        localAudioTrack,
        localCameraTrack,
        localScreenTrack,
        isMicEnabled,
        isHeadphonesOn,
        isFocusModeOn,
    });
    
    useSfuSocketEvents({
        supervisorRef,
        applySpeakers,
        setRemoteMicMuted,
        setRemotePrivacy,
    });

    /** Ends the session and everything that depends on it. */
    const endSession = useCallback(() => {
        supervisorRef.current?.stop();
        supervisorRef.current = null;
        stopCpuReadingRef.current?.();
        stopCpuReadingRef.current = null;
        applySpeakers([]);
        stopAllRemote();
    }, [applySpeakers, stopAllRemote]);

    /** Starts a session with what the person is sending right now. */
    const beginSession = useCallback(() => {
        endSession();

        const signal = createSfuSignal(socket as unknown as SfuSocket);
        const supervisor = new SfuSupervisor({
            signal,
            events: {
                onRemoteTrack: playRemote,
                onRemoteTrackClosed: stopRemote,
                onRemoteTrackClosedAll: stopAllRemote,
            },
            createClient: (events) =>
                new SfuClient(
                    signal,
                    events,
                    undefined,
                    connectionReporter.getReport
                ),
        });
        supervisorRef.current = supervisor;

        const latest = latestRef.current;
        supervisor.setTrack("mic", latest.localAudioTrack);
        supervisor.setTrack("camera", latest.localCameraTrack);
        supervisor.setTrack("screen", latest.localScreenTrack);
        socket.emit("media:set-muted", { muted: !latest.isMicEnabled });
        socket.emit("media:set-privacy", {
            headphones: latest.isHeadphonesOn,
            focus: latest.isFocusModeOn,
        });
        stopCpuReadingRef.current = startCpuReading(supervisor);

        supervisor.start().catch((error) => {
            console.warn("[multiplayer] could not start the media session", error);
        });
    }, [endSession, latestRef, playRemote, stopAllRemote, stopRemote]);

    /** The people the local user sees in a big tile, each with the layer that tile needs. */
    const setFocus = useCallback((views: readonly MediaView[]) => {
        supervisorRef.current?.setFocus(views);
    }, []);

    /** The people the local user pinned, who keep a video slot while close. */
    const setPins = useCallback((pinnedUserIds: readonly string[]) => {
        supervisorRef.current?.setPins(pinnedUserIds);
    }, []);

    /** Builds the media session again, for the dev harness. */
    const rebuildSession = useCallback(() => {
        supervisorRef.current?.reset();
    }, []);

    /**
     * The failures the dev console can cause on the media session. Each one
     * does nothing when there is no session.
     */
    const failures = useMemo(
        () => ({
            restartIce: () => supervisorRef.current?.forceIceRestart(),
            publishTransportError: (type: TransportErrorType) =>
                supervisorRef.current?.simulateTransportError(type),
            dropSendTransport: () => supervisorRef.current?.forgetSendTransport(),
            pauseConsumers: () => supervisorRef.current?.pauseConsumers(),
            resumeConsumers: () => supervisorRef.current?.resumeConsumers(),
            dropTransports: () => supervisorRef.current?.dropTransports(),
        }),
        []
    );

    return {
        remoteVideos: remote.remoteVideos,
        setActiveVideoIds: remote.setActiveVideoIds,
        beginSession,
        endSession,
        setFocus,
        setPins,
        rebuildSession,
        failures,
    };
}
