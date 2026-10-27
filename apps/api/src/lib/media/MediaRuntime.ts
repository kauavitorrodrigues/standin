import { MediaEvents, MediaUnavailableError } from "@standin/contracts";
import {
    createDirtyTracker,
    MediaServer,
    type MediaServerOptions,
    type SpaceMedia,
} from "@standin/media";
import { resolveSpaceSettings } from "@/lib/socket/services/resolveSpaceSettings";
import { SocketManager } from "@/lib/socket/socketManager";
import { mediaNotifier } from "./mediaNotifier";
import { MEDIA_RESTART_DELAY_MS } from "./consts/media";
import { MediaLogMessages } from "./consts/messages";

// Who the planner has to look at on the next tick, for every space.
export const mediaDirty = createDirtyTracker();

let server: MediaServer | null = null;
let options: MediaServerOptions | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let stopped = false;

const spacesWithRooms = new Set<string>();

const launch = async (): Promise<void> => {
    if (!options) return;
    const created = await MediaServer.create(options, mediaNotifier);
    server = created;
    console.log(MediaLogMessages.started);

    created.onDied(() => {
        console.error(MediaLogMessages.workerDied);
        server = null;
        spacesWithRooms.clear();
        // Every client builds its device again once told.
        SocketManager.get().emit(MediaEvents.RESET);
        scheduleRestart();
    });
};

// Starts a worker again after a pause, for a worker that died or one that
// could not start (for example because the port was still taken).
const scheduleRestart = (): void => {
    if (stopped) return;
    restartTimer = setTimeout(() => {
        launch().catch((error) => {
            console.error(MediaLogMessages.restartFailed, error);
            scheduleRestart();
        });
    }, MEDIA_RESTART_DELAY_MS);
    restartTimer.unref();
};

/**
 * Starts the media server. A start that fails is logged and tried again, so a
 * person who joins before the worker is up, or after a port conflict clears,
 * gets media without restarting the API.
 */
const start = async (serverOptions: MediaServerOptions): Promise<void> => {
    stopped = false;
    options = serverOptions;
    try {
        await launch();
    } catch (error) {
        console.error(MediaLogMessages.restartFailed, error);
        scheduleRestart();
    }
};

const stop = (): void => {
    stopped = true;
    if (restartTimer) clearTimeout(restartTimer);
    server?.close();
    server = null;
    spacesWithRooms.clear();
};

// Replaces the server, for tests that bring their own.
const useServer = (replacement: MediaServer | null): void => {
    server = replacement;
};

/** The process id of the worker, for tests that kill it. */
const workerPid = (): number | undefined => server?.worker.pid;

const isRunning = (): boolean => server !== null;

const requireServer = (): MediaServer => {
    if (!server) throw new MediaUnavailableError();
    return server;
};

const acquireRoom = async (spaceId: string): Promise<SpaceMedia> => {
    const room = await requireServer().acquireRoom(spaceId);
    // The reach of the space is read once, when its room is first acquired.
    // A later save reaches the room through broadcastSpaceSettingsChange.
    if (!spacesWithRooms.has(spaceId)) {
        const settings = await resolveSpaceSettings(spaceId);
        room.setProximityPreset(settings.proximityPreset);
    }
    spacesWithRooms.add(spaceId);
    return room;
};

const getRoom = (spaceId: string): SpaceMedia | undefined =>
    server?.getRoom(spaceId);

// The spaces that have a router right now.
const activeSpaceIds = (): string[] => [...spacesWithRooms];

// A person left the space or the connection dropped. Their transports,
// producers and consumers close, and the router closes with the last person.
const leave = (spaceId: string, socketId: string): void => {
    const room = server?.getRoom(spaceId);
    if (!room) return;

    room.removePeer(socketId);
    // The ones around the person lose them, and may now fit someone else.
    mediaDirty.markMoved(spaceId, socketId);
    if (room.peerCount() > 0) return;

    server?.releaseRoomIfEmpty(spaceId);
    spacesWithRooms.delete(spaceId);
    mediaDirty.forget(spaceId);
};

const usage = () => server?.usage();

const startTelemetry = (write: Parameters<MediaServer["startTelemetry"]>[0]) =>
    server?.startTelemetry(write);

/**
 * The media server of the API process, as one shared object. It starts and
 * stops the worker, starts it again when it dies (and tells every client to
 * rebuild its session), hands out the media of each space and cleans up when
 * a person leaves.
 *
 * Handlers and tickers talk to this object and never to the server directly,
 * so a test can swap the server with `useServer`.
 */
export const MediaRuntime = {
    start,
    stop,
    useServer,
    isRunning,
    workerPid,
    acquireRoom,
    getRoom,
    activeSpaceIds,
    leave,
    usage,
    startTelemetry,
};
