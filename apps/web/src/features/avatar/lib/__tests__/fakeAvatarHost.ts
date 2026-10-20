import { vi } from "vitest";
import type { AvatarRegistryHost } from "../AvatarTextureRegistry";

type Listener = (file: { key: string }) => void;

// A Phaser scene reduced to what the avatar code touches. `finishLoad` and
// `failLoad` play what the loader does when a file settles.
export const createFakeAvatarHost = () => {
    const textures = new Set<string>();
    const animations = new Set<string>();
    const listeners = new Map<string, Set<Listener>>();
    let isLoading = false;

    const emit = (event: string, file: { key: string }): void => {
        [...(listeners.get(event) ?? [])].forEach((listener) => listener(file));
    };

    const host = {
        textures: {
            exists: (key: string) => textures.has(key),
            remove: vi.fn((key: string) => textures.delete(key)),
        },
        anims: {
            exists: (key: string) => animations.has(key),
            remove: vi.fn((key: string) => animations.delete(key)),
            generateFrameNumbers: vi.fn(
                (key: string, config: { frames: number[] }) =>
                    config.frames.map((frame) => ({ key, frame }))
            ),
            create: vi.fn((config: { key?: string }) => {
                if (config.key) animations.add(config.key);
            }),
        },
        load: {
            spritesheet: vi.fn(),
            on: (event: string, listener: Listener) => {
                const set = listeners.get(event) ?? new Set<Listener>();
                set.add(listener);
                listeners.set(event, set);
            },
            off: (event: string, listener: Listener) => {
                listeners.get(event)?.delete(listener);
            },
            isLoading: () => isLoading,
            start: vi.fn(() => {
                isLoading = true;
            }),
        },
    };

    return {
        host: host as unknown as AvatarRegistryHost,
        mocks: host,
        textures,
        animations,
        listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
        finishLoad: (key: string) => {
            isLoading = false;
            textures.add(key);
            emit(`filecomplete-spritesheet-${key}`, { key });
        },
        failLoad: (key: string) => {
            isLoading = false;
            emit("loaderror", { key });
        },
    };
};
