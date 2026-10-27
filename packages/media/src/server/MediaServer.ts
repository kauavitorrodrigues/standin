import * as mediasoup from "mediasoup";
import type { types } from "mediasoup";
import { MEDIA_CODECS, MEDIA_TELEMETRY_INTERVAL_MS } from "../consts/server";
import { SpaceMedia } from "./SpaceMedia";
import { buildListenInfos } from "./utils/buildListenInfos";
import { buildUsage, sumCounts } from "./utils/buildUsage";
import type { MediaNotifier, MediaServerOptions, MediaUsage } from "./types";

/**
 * The media server of the process. It owns one mediasoup worker (a C++ child
 * process), one WebRtcServer that listens on a single UDP and TCP port for
 * every client, and one {@link SpaceMedia} (a router) for each space that has
 * someone in it.
 *
 * It never decodes or mixes media. It only forwards the streams that the
 * subscription planner allows, so its cost grows with the number of streams
 * and not with the quality of each one.
 *
 * Lifecycle: {@link MediaServer.create} starts the worker, {@link acquireRoom}
 * builds the router of a space on demand, {@link releaseRoomIfEmpty} closes it
 * when the last person leaves and {@link close} stops the worker.
 */
export class MediaServer {
    private readonly rooms = new Map<string, SpaceMedia>();
    private readonly pending = new Map<string, Promise<SpaceMedia>>();
    private readonly diedListeners = new Set<() => void>();
    private telemetry: NodeJS.Timeout | null = null;
    private closed = false;

    private constructor(
        readonly worker: types.Worker,
        readonly webRtcServer: types.WebRtcServer,
        private readonly notifier: MediaNotifier
    ) {
        worker.on("died", () => {
            if (this.closed) return;
            this.rooms.forEach((room) => room.close());
            this.rooms.clear();
            this.pending.clear();
            this.diedListeners.forEach((listener) => listener());
        });
    }

    /**
     * Starts the worker and the shared WebRtcServer.
     *
     * @param options Where the server listens and which address it announces.
     * @param notifier How the server tells a client that a stream appeared or
     * went away. The transport (Socket.IO) lives outside this package.
     */
    static async create(
        options: MediaServerOptions,
        notifier: MediaNotifier
    ): Promise<MediaServer> {
        const worker = await mediasoup.createWorker({
            logLevel: options.logLevel ?? "warn",
        });

        const webRtcServer = await worker.createWebRtcServer({
            listenInfos: buildListenInfos(options),
        });

        return new MediaServer(worker, webRtcServer, notifier);
    }

    /**
     * Registers a listener for the death of the worker process. By then every
     * room is already closed, and the clients rebuild their session when they
     * notice their transports failed.
     *
     * @returns A function that removes the listener.
     */
    onDied(listener: () => void): () => void {
        this.diedListeners.add(listener);
        return () => this.diedListeners.delete(listener);
    }

    /**
     * The media of a space, created when the first person asks for it. Two
     * calls at the same time for the same space share one creation.
     */
    async acquireRoom(spaceId: string): Promise<SpaceMedia> {
        const existing = this.rooms.get(spaceId);
        if (existing) return existing;

        const inFlight = this.pending.get(spaceId);
        if (inFlight) return inFlight;

        const creating = this.createRoom(spaceId).finally(() => {
            this.pending.delete(spaceId);
        });
        this.pending.set(spaceId, creating);
        return creating;
    }

    private async createRoom(spaceId: string): Promise<SpaceMedia> {
        const router = await this.worker.createRouter({
            mediaCodecs: MEDIA_CODECS,
        });
        const room = await SpaceMedia.create(
            spaceId,
            router,
            this.webRtcServer,
            this.notifier
        );
        this.rooms.set(spaceId, room);
        return room;
    }

    /** The media of a space if it exists, without creating it. */
    getRoom(spaceId: string): SpaceMedia | undefined {
        return this.rooms.get(spaceId);
    }

    /** Closes the router of a space when nobody is left in it. */
    releaseRoomIfEmpty(spaceId: string): void {
        const room = this.rooms.get(spaceId);
        if (!room || room.peerCount() > 0) return;
        room.close();
        this.rooms.delete(spaceId);
    }

    /**
     * What the server holds and what the worker process has used so far, for
     * the telemetry and for the validation tools.
     */
    async usage(): Promise<MediaUsage> {
        const resources = await this.worker.getResourceUsage();
        const counts = sumCounts(
            [...this.rooms.values()].map((room) => room.counts())
        );
        return buildUsage(this.rooms.size, counts, resources);
    }

    /**
     * Calls `write` with the usage on a timer. The timer does not keep the
     * process alive.
     */
    startTelemetry(
        write: (usage: MediaUsage) => void,
        intervalMs: number = MEDIA_TELEMETRY_INTERVAL_MS
    ): void {
        if (this.telemetry) return;
        this.telemetry = setInterval(() => {
            this.usage().then(write, () => undefined);
        }, intervalMs);
        this.telemetry.unref();
    }

    /** Closes every room and stops the worker. Safe to call twice. */
    close(): void {
        if (this.closed) return;
        this.closed = true;
        if (this.telemetry) clearInterval(this.telemetry);
        this.rooms.forEach((room) => room.close());
        this.rooms.clear();
        this.worker.close();
    }
}
