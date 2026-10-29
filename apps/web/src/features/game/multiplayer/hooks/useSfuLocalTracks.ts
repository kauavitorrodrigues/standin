import { useEffect, useRef, type RefObject } from "react";
import { socket } from "../socket";
import type { SfuSupervisor } from "../lib/SfuSupervisor";
import type { LocalMedia } from "../types/sfuHooks";

/**
 * Keeps what the person sends in step with their devices: each local track
 * goes to the media session as it appears, changes or ends, and the mute state
 * of the microphone is told to the server so the others can show it.
 *
 * @returns A ref with the latest values, read when a new session begins so it
 * starts with what the person is sending right now.
 */
export function useSfuLocalTracks(
    supervisorRef: RefObject<SfuSupervisor | null>,
    media: LocalMedia
): RefObject<LocalMedia> {
    
    const {
        localAudioTrack,
        localCameraTrack,
        localScreenTrack,
        localScreenAudioTrack,
        isMicEnabled,
        isHeadphonesOn,
        isFocusModeOn,
    } = media;
    
    const latestRef = useRef(media);

    useEffect(() => {
        latestRef.current = media;
    });

    useEffect(() => {
        supervisorRef.current?.setTrack("mic", localAudioTrack);
    }, [supervisorRef, localAudioTrack]);
    useEffect(() => {
        supervisorRef.current?.setTrack("camera", localCameraTrack);
    }, [supervisorRef, localCameraTrack]);
    useEffect(() => {
        supervisorRef.current?.setTrack("screen", localScreenTrack);
    }, [supervisorRef, localScreenTrack]);
    useEffect(() => {
        supervisorRef.current?.setTrack("screen-audio", localScreenAudioTrack);
    }, [supervisorRef, localScreenAudioTrack]);
    useEffect(() => {
        if (!supervisorRef.current) return;
        socket.emit("media:set-muted", { muted: !isMicEnabled });
    }, [supervisorRef, isMicEnabled]);
    useEffect(() => {
        if (!supervisorRef.current) return;
        socket.emit("media:set-privacy", {
            headphones: isHeadphonesOn,
            focus: isFocusModeOn,
        });
    }, [supervisorRef, isHeadphonesOn, isFocusModeOn]);

    return latestRef;
}
