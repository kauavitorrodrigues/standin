import {
    SOUND_EFFECT_STATE,
    type SoundEffectState,
} from "@/features/sounds/consts/soundEffect";
import { registry } from "@/features/sounds/lib/registry";

type SinkableAudioElement = HTMLAudioElement & {
    setSinkId?: (deviceId: string) => Promise<void>;
};

// A short sound over a plain <audio> element. It never throws: a sound that
// cannot load or is not allowed to play just reports false, and it is up to
// the caller whether to try again. The volume is not mixed here; whoever
// plays reads the setting that fits the sound and sets it first.
export class SoundEffect {
    private readonly audio = new Audio();
    private readonly ready: Promise<boolean>;
    private objectUrl: string | null = null;
    private currentState: SoundEffectState = SOUND_EFFECT_STATE.INITIALIZED;

    constructor(
        source: string | MediaStream,
        loop = false,
        volume = 1,
        autoplay = false
    ) {
        this.audio.loop = loop;
        this.audio.volume = volume;
        this.ready =
            typeof source === "string"
                ? this.loadFromUrl(source)
                : this.useStream(source);

        registry.track(this);
        if (autoplay) void this.play();
    }

    get state(): SoundEffectState {
        return this.currentState;
    }

    // Fetched as a blob first so a network failure shows up here, once,
    // instead of at the moment of the first play.
    private async loadFromUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            if (this.currentState === SOUND_EFFECT_STATE.DESTROYED)
                return false;

            this.objectUrl = URL.createObjectURL(blob);
            this.audio.src = this.objectUrl;
            return true;
        } catch (error) {
            console.error("[Sounds] - Could not load a sound", url, error);
            this.currentState = SOUND_EFFECT_STATE.ERRORED;
            return false;
        }
    }

    private async useStream(stream: MediaStream): Promise<boolean> {
        this.audio.srcObject = stream;
        return true;
    }

    async play(resetToStart = true): Promise<boolean> {
        if (this.currentState === SOUND_EFFECT_STATE.DESTROYED) return false;
        if (this.currentState === SOUND_EFFECT_STATE.STARTING_PLAY)
            return false;

        this.currentState = SOUND_EFFECT_STATE.STARTING_PLAY;
        if (!(await this.ready)) {
            this.currentState = SOUND_EFFECT_STATE.ERRORED;
            return false;
        }

        if (resetToStart) this.audio.currentTime = 0;
        try {
            await this.audio.play();
            if (this.currentState === SOUND_EFFECT_STATE.STARTING_PLAY)
                this.currentState = SOUND_EFFECT_STATE.PLAYING;
            return true;
        } catch (error) {
            // Most often the browser refusing to play before the person
            // has interacted with the page.
            console.warn("[Sounds] - Could not play a sound", error);
            this.currentState = SOUND_EFFECT_STATE.ERRORED;
            return false;
        }
    }

    pause(): void {
        this.audio.pause();
        if (this.currentState === SOUND_EFFECT_STATE.PLAYING)
            this.currentState = SOUND_EFFECT_STATE.PAUSED;
    }

    setVolume(volume: number): void {
        this.audio.volume = Math.min(1, Math.max(0, volume));
    }

    // A browser without setSinkId keeps the default output.
    setSinkId(deviceId: string | null): void {
        const sinkable = this.audio as SinkableAudioElement;
        if (typeof sinkable.setSinkId !== "function") return;

        void sinkable.setSinkId(deviceId ?? "").catch(() => {});
    }

    destroy(): void {
        this.currentState = SOUND_EFFECT_STATE.DESTROYED;
        registry.untrack(this);
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.srcObject = null;
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
    }
}
