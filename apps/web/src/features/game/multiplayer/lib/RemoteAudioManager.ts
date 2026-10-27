import { getAudibleCeiling, selectAudiblePeers } from "../utils/audio";

type SinkableAudioElement = HTMLAudioElement & {
    setSinkId?: (deviceId: string) => Promise<void>;
};

/**
 * Audio element manager for the SFU. One instance per Space session, it owns
 * a hidden <audio> element per remote voice the server sends, playing its
 * media stream. Elements are keyed by the socket id of the speaker, the same
 * id the scene uses to set the distance based volume (see MapScene), so the
 * volume is set separately rather than baked in here. The audible ceiling is
 * only a safety net and never drops below what the server sends.
 */
export class RemoteAudioManager {
    private readonly audioElements = new Map<string, HTMLAudioElement>();
    // Elements whose play() was rejected by the browser's autoplay policy.
    // Browsers don't retry a blocked element on their own once the user
    // finally interacts with the page - only a fresh play() call does that -
    // so this manager has to track and retry them itself.
    private readonly blockedAudioElements = new Set<HTMLAudioElement>();
    private gestureRetryAttached = false;
    private sinkId: string | null = null;
    // What the distance falloff asked for, per peer, before the master volume
    // is applied on top.
    private readonly proximityVolumes = new Map<string, number>();
    private masterVolume = 1;
    private readonly speakingPeers = new Set<string>();
    // Peers in range that lost the ceiling: paused, but kept attached.
    private readonly suspendedPeers = new Set<string>();
    private readonly ceiling = getAudibleCeiling(
        typeof navigator === "undefined"
            ? {}
            : (navigator as Navigator & { deviceMemory?: number })
    );
    // play() is async: its rejection can land after remove()/removeAll()
    // already ran (e.g. on unmount). Without this, that late rejection
    // would re-insert the (already torn down) element into
    // blockedAudioElements and re-attach the window gesture listeners with
    // nothing left to ever remove them again.
    private disposed = false;

    private readonly retryBlockedPlayback = (): void => {
        this.blockedAudioElements.forEach((audio) => this.attemptPlay(audio));
    };

    attach(socketId: string, stream: MediaStream): void {
        const audio = this.audioElements.get(socketId) ?? new Audio();
        // Only the audio tracks: this manager's job is voice, and the stream
        // could in principle carry a video track too (e.g. a screen share)
        // that has no business playing through here.
        audio.srcObject = new MediaStream(stream.getAudioTracks());
        audio.autoplay = true;
        // Starts silent, not at the browser default of 1: the distance-based
        // proximity loop is what's supposed to set the real volume, but it
        // only runs on MapScene's throttle tick, and won't run at all if
        // this peer's avatar isn't in `remoteAvatars` yet (or ever, if it
        // gets removed while the connection lives on). Defaulting to silence
        // means either case fails safe instead of leaving the peer audible
        // from anywhere on the map.
        audio.volume = 0;
        this.proximityVolumes.set(socketId, 0);
        this.applySinkId(audio);

        this.audioElements.set(socketId, audio);
        this.attemptPlay(audio);
    }

    remove(socketId: string): void {
        const audio = this.audioElements.get(socketId);
        if (!audio) return;

        audio.pause();
        audio.srcObject = null;
        this.audioElements.delete(socketId);
        this.proximityVolumes.delete(socketId);
        this.speakingPeers.delete(socketId);
        this.suspendedPeers.delete(socketId);
        this.blockedAudioElements.delete(audio);
    }

    removeAll(): void {
        this.disposed = true;

        Array.from(this.audioElements.keys()).forEach((socketId) =>
            this.remove(socketId)
        );

        if (this.gestureRetryAttached) {
            window.removeEventListener(
                "pointerdown",
                this.retryBlockedPlayback
            );
            window.removeEventListener("keydown", this.retryBlockedPlayback);
            this.gestureRetryAttached = false;
        }
    }

    setVolume(socketId: string, volume: number): void {
        const audio = this.audioElements.get(socketId);
        if (!audio) return;

        this.proximityVolumes.set(socketId, volume);
        audio.volume = volume * this.masterVolume;
        this.applyCeiling();
    }

    // Fed by the speaking detectors. Speakers win the audible slots.
    setSpeaking(socketId: string, isSpeaking: boolean): void {
        if (!this.audioElements.has(socketId)) return;

        if (isSpeaking) this.speakingPeers.add(socketId);
        else this.speakingPeers.delete(socketId);
        this.applyCeiling();
    }

    // Pauses the in-range peers beyond the ceiling and resumes the ones that
    // made it back in. Volume itself stays the local distance curve.
    private applyCeiling(): void {
        const audible = selectAudiblePeers(
            Array.from(this.proximityVolumes, ([id, volume]) => ({
                id,
                volume,
                isSpeaking: this.speakingPeers.has(id),
            })),
            this.ceiling
        );

        this.audioElements.forEach((audio, socketId) => {
            const inRange = (this.proximityVolumes.get(socketId) ?? 0) > 0;
            const suspended = this.suspendedPeers.has(socketId);

            if (inRange && !audible.has(socketId)) {
                if (suspended) return;
                this.suspendedPeers.add(socketId);
                this.blockedAudioElements.delete(audio);
                audio.pause();
                return;
            }

            if (!suspended) return;
            this.suspendedPeers.delete(socketId);
            this.attemptPlay(audio);
        });
    }

    // The user's own output volume, applied on top of every peer's distance
    // volume right away and to the ones created afterwards.
    setMasterVolume(volume: number): void {
        this.masterVolume = volume;
        this.audioElements.forEach((audio, socketId) => {
            audio.volume = (this.proximityVolumes.get(socketId) ?? 0) * volume;
        });
    }

    // Applied to every current audio element immediately, and to every one
    // created afterwards via attach(); a no-op wherever setSinkId isn't
    // supported (Safari/Firefox at time of writing).
    setSinkId(deviceId: string | null): void {
        this.sinkId = deviceId;
        this.audioElements.forEach((audio) => this.applySinkId(audio));
    }

    private applySinkId(audio: HTMLAudioElement): void {
        if (!this.sinkId) return;

        const sinkable = audio as SinkableAudioElement;
        if (typeof sinkable.setSinkId !== "function") return;

        void sinkable.setSinkId(this.sinkId).catch(() => {});
    }

    private attemptPlay(audio: HTMLAudioElement): void {
        audio
            .play()
            .then(() => {
                this.blockedAudioElements.delete(audio);
            })
            .catch(() => {
                // The manager (or just this element, via remove()) may have
                // been torn down while this play() was still pending -
                // nothing left to retry it for.
                if (this.disposed || !this.isTracked(audio)) return;

                this.blockedAudioElements.add(audio);
                this.ensureGestureRetry();
            });
    }

    private isTracked(audio: HTMLAudioElement): boolean {
        for (const element of this.audioElements.values()) {
            if (element === audio) return true;
        }
        return false;
    }

    private ensureGestureRetry(): void {
        if (this.gestureRetryAttached) return;
        this.gestureRetryAttached = true;

        window.addEventListener("pointerdown", this.retryBlockedPlayback);
        window.addEventListener("keydown", this.retryBlockedPlayback);
    }
}
