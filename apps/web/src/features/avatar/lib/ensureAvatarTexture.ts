import { AVATAR } from "@standin/contracts";
import { AVATAR_LOADER_EVENTS } from "../consts/textures";

// What the loader passes to a listener: the file the event is about.
type LoaderListener = (file: { key: string }) => void;

// The parts of the Phaser scene the loading needs, so it can run without one.
export type AvatarTextureHost = {
    textures: { exists: (key: string) => boolean };
    load: {
        spritesheet: (
            key: string,
            url: string,
            config: { frameWidth: number; frameHeight: number }
        ) => unknown;
        on: (event: string, listener: LoaderListener) => unknown;
        off: (event: string, listener: LoaderListener) => unknown;
        isLoading: () => boolean;
        start: () => unknown;
    };
};

export type AvatarTextureRequest = {
    key: string;
    url: string;
    // Starts the loader when it is idle. Leave it off inside `preload`, where
    // the scene starts the loader itself.
    autoStart?: boolean;
};

export type AvatarTextureHandlers = {
    onReady: () => void;
    onError: () => void;
};

type Waiter = AvatarTextureHandlers;

// The loads in flight of each scene, by texture key, so a sheet that two
// avatars ask for at once is requested once.
const pendingByHost = new WeakMap<object, Map<string, Waiter[]>>();

const getPending = (host: object): Map<string, Waiter[]> => {
    const existing = pendingByHost.get(host);
    if (existing) return existing;

    const created = new Map<string, Waiter[]>();
    pendingByHost.set(host, created);
    return created;
};

/**
 * Loads the sheet of an avatar as a spritesheet of `AVATAR.frame` frames and
 * tells when it is ready or when it failed (a 404 included). A texture that
 * already exists is ready at once, and a sheet that is already loading is not
 * asked for again: the handlers just wait for the load in flight.
 */
export const ensureAvatarTexture = (
    host: AvatarTextureHost,
    request: AvatarTextureRequest,
    handlers: AvatarTextureHandlers
): void => {
    const { key, url, autoStart = true } = request;

    if (host.textures.exists(key)) {
        handlers.onReady();
        return;
    }

    const pending = getPending(host);
    const waiters = pending.get(key);
    if (waiters) {
        waiters.push(handlers);
        return;
    }

    pending.set(key, [handlers]);

    const completeEvent = `${AVATAR_LOADER_EVENTS.FILE_COMPLETE_PREFIX}${key}`;
    const settle = (outcome: keyof AvatarTextureHandlers): void => {
        host.load.off(completeEvent, onComplete);
        host.load.off(AVATAR_LOADER_EVENTS.FILE_ERROR, onFileError);
        const settled = pending.get(key) ?? [];
        pending.delete(key);
        settled.forEach((waiter) => waiter[outcome]());
    };
    const onComplete: LoaderListener = () => settle("onReady");
    // Any file of the loader can fail, so only the one of this sheet counts.
    const onFileError: LoaderListener = (file) => {
        if (file.key === key) settle("onError");
    };

    host.load.on(completeEvent, onComplete);
    host.load.on(AVATAR_LOADER_EVENTS.FILE_ERROR, onFileError);
    host.load.spritesheet(key, url, {
        frameWidth: AVATAR.frame.w,
        frameHeight: AVATAR.frame.h,
    });

    if (autoStart && !host.load.isLoading()) host.load.start();
};
