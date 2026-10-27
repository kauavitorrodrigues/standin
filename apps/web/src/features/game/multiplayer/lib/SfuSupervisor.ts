import { MediaEvents, type MediaConsumerNewPayload } from "@standin/contracts";
import { logMedia } from "../utils/logMedia";
import { backoffDelay } from "../utils/backoffDelay";
import type { SfuSource } from "../types/sfu";
import type { MediaView } from "../types/mediaView";
import type { SfuSupervisorOptions } from "../types/sfuSupervisor";
import { wait as realWait } from "../utils/wait";
import { AttemptRateTracker } from "./AttemptRateTracker";
import type { SfuClient } from "./SfuClient";

/**
 * Keeps one media session alive for the whole stay in a space. It builds a
 * {@link SfuClient}, and when the client reports a broken transport it asks
 * the server to drop the old session, waits with an exponential backoff and
 * builds a new client, producing again what the person was sending.
 *
 * The supervisor remembers what the person wants (the tracks, the focus, the
 * pins and the low quality flag), so a new client starts exactly where the old one was.
 * After too many attempts inside the window of {@link AttemptRateTracker} it
 * gives up until the next join, which builds a fresh supervisor.
 */
export class SfuSupervisor {
    private readonly options: SfuSupervisorOptions;
    private readonly attempts = new AttemptRateTracker();
    private readonly tracks = new Map<SfuSource, MediaStreamTrack>();
    private current: SfuClient | null = null;
    private focus: readonly MediaView[] = [];
    private pins: string[] = [];
    private lowQuality = false;
    private stopped = false;
    private rebuilding = false;
    // The server only knows the person once the session is built, so a message
    // sent before is refused. It is sent again when the session is ready.
    private ready = false;

    constructor(options: SfuSupervisorOptions) {
        this.options = options;
    }

    /**
     * Builds the first session. If it cannot be built (the media server is not
     * ready yet, a request timed out) the supervisor tries again by itself with
     * the same backoff as a broken session, instead of leaving the person with
     * no media until they reload.
     */
    async start(): Promise<void> {
        try {
            await this.build();
        } catch (error) {
            console.warn(
                "[multiplayer] could not start the media session",
                error
            );
            if (this.current) void this.rebuild(this.current);
        }
    }

    private async build(): Promise<void> {
        const client = this.options.createClient({
            ...this.options.events,
            onBroken: () => void this.rebuild(client),
        });
        this.current = client;
        this.ready = false;
        this.tracks.forEach((track, source) => client.setTrack(source, track));
        await client.start();
        this.ready = true;
        if (this.focus.length > 0) this.sendFocus();
        if (this.pins.length > 0) this.sendPins();
        if (this.lowQuality) this.sendLowQuality();
    }

    private async rebuild(broken: SfuClient): Promise<void> {
        const isCurrent = this.current === broken;
        if (this.stopped || this.rebuilding || !isCurrent) return;

        this.rebuilding = true;
        try {
            await this.rebuildLoop(broken);
        } finally {
            this.rebuilding = false;
        }
    }

    private async rebuildLoop(broken: SfuClient): Promise<void> {
        const wait = this.options.wait ?? realWait;
        let previous = broken;

        for (let attempt = 0; !this.stopped; attempt += 1) {
            if (this.attempts.shouldGiveUp()) return;
            this.attempts.recordAttempt();

            logMedia(`building the session again, attempt ${attempt + 1}`);
            previous.close();
            this.options.events.onRemoteTrackClosedAll?.();
            await wait(backoffDelay(attempt));
            if (this.stopped) return;

            try {
                await this.options.signal.request(MediaEvents.RESTART);
                await this.build();
                return;
            } catch (error) {
                console.warn(
                    "[multiplayer] media session rebuild failed",
                    error
                );
                if (this.current) previous = this.current;
            }
        }
    }

    /** What the person sends. A null track stops sending that source. */
    setTrack(source: SfuSource, track: MediaStreamTrack | null): void {
        if (track) this.tracks.set(source, track);
        else this.tracks.delete(source);
        this.current?.setTrack(source, track);
    }

    /** The people the local user sees in a big tile, each with the layer that tile needs. */
    setFocus(views: readonly MediaView[]): void {
        this.focus = views;
        this.sendFocus();
    }

    private sendFocus(): void {
        if (!this.ready) return;
        this.options.signal.send(MediaEvents.SET_FOCUS, { views: [...this.focus] });
    }

    /** The people the local user pinned, who keep a video slot while close. */
    setPins(userIds: readonly string[]): void {
        this.pins = [...userIds];
        this.sendPins();
    }

    private sendPins(): void {
        if (!this.ready) return;
        this.options.signal.send(MediaEvents.SET_PINS, {
            userIds: this.pins,
        });
    }

    /** A weak machine asks for the low layer and fewer streams. */
    setLowQuality(enabled: boolean): void {
        this.lowQuality = enabled;
        this.sendLowQuality();
    }

    private sendLowQuality(): void {
        if (!this.ready) return;
        this.options.signal.send(MediaEvents.SET_LOW_QUALITY, {
            enabled: this.lowQuality,
        });
    }

    /** Whether anybody receives a video this person sends. */
    setDemand(source: SfuSource, wanted: boolean): void {
        this.current?.setDemand(source, wanted);
    }

    handleConsumerNew(payload: MediaConsumerNewPayload): void {
        void this.current?.handleConsumerNew(payload);
    }

    handleConsumerClosed(consumerId: string): void {
        this.current?.handleConsumerClosed(consumerId);
    }

    /** The server restarted its media, so the session is built again. */
    reset(): void {
        if (this.current) void this.rebuild(this.current);
    }

    getVideoSenders(): RTCRtpSender[] {
        return this.current?.getVideoSenders() ?? [];
    }

    /** Closes the session for good. */
    stop(): void {
        this.stopped = true;
        this.ready = false;
        this.attempts.dispose();
        this.current?.close();
        this.current = null;
    }
}
