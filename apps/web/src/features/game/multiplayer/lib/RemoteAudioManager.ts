type SinkableAudioElement = HTMLAudioElement & {
    setSinkId?: (deviceId: string) => Promise<void>;
};

// One instance per Space session, mirroring PeerConnectionManager: owns a
// hidden <audio> element per connected peer, playing its remote media
// stream. Volume per peer is set separately (see MapScene's distance-based
// calculation) rather than baked in here.
export class RemoteAudioManager {
    private readonly audioElements = new Map<string, HTMLAudioElement>();
    // Elements whose play() was rejected by the browser's autoplay policy.
    // Browsers don't retry a blocked element on their own once the user
    // finally interacts with the page - only a fresh play() call does that -
    // so this manager has to track and retry them itself.
    private readonly blockedAudioElements = new Set<HTMLAudioElement>();
    private gestureRetryAttached = false;
    private sinkId: string | null = null;
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
        // Only the audio tracks: this manager's job is voice, and a peer
        // connection could in principle carry a video track too (e.g. a
        // future screen share) that has no business playing through here.
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

        audio.volume = volume;
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
