import { AVATAR_DIAGNOSTIC_MESSAGES } from "../consts/diagnostics";
import { AVATAR_GHOST_TEXTURE_KEY } from "../consts/textures";
import { buildAvatarTextureKey } from "./avatarKeys";
import {
    ensureAvatarTexture,
    type AvatarTextureHost,
} from "./ensureAvatarTexture";
import {
    listAvatarAnimationKeys,
    registerAvatarAnimations,
    type AvatarAnimationHost,
} from "./registerAvatarAnimations";

// The parts of the Phaser scene the registry needs, so it can run without one.
export type AvatarRegistryHost = AvatarTextureHost &
    AvatarAnimationHost & {
        textures: { remove: (key: string) => unknown };
        anims: { remove: (key: string) => unknown };
    };

// What an avatar holds while it shows a sheet. Release it when the avatar goes
// away or changes sheet, so the texture can be destroyed.
export type AvatarTextureLease = {
    // The texture to draw now: the ghost until the sheet is ready, and the
    // ghost for good when the sheet did not load.
    getKey: () => string;
    release: () => void;
};

const SHEET_STATUS = {
    LOADING: "loading",
    READY: "ready",
    FAILED: "failed",
} as const;

type SheetStatus = (typeof SHEET_STATUS)[keyof typeof SHEET_STATUS];

type SheetEntry = {
    status: SheetStatus;
    refs: number;
    listeners: Set<() => void>;
};

/**
 * Counts the avatars that use each sheet of the scene. A sheet is loaded when
 * the first avatar asks for it, shared by the ones that ask next, and
 * destroyed (texture and animations) when the last one lets go. Until a sheet
 * is ready, and when it fails or is gone (404), the avatar draws the ghost, so
 * a broken sheet never breaks a sprite.
 */
export class AvatarTextureRegistry {
    private readonly host: AvatarRegistryHost;
    private readonly resolveUrl: (fileId: string) => string;
    private readonly entries = new Map<string, SheetEntry>();

    constructor(
        host: AvatarRegistryHost,
        resolveUrl: (fileId: string) => string
    ) {
        this.host = host;
        this.resolveUrl = resolveUrl;
    }

    // How many avatars hold the sheet, zero when it is not in the scene.
    getReferenceCount(fileId: string): number {
        return this.entries.get(fileId)?.refs ?? 0;
    }

    // Asks for the sheet of a file. `null` is an avatar without sheet, which
    // draws the ghost and holds nothing. `onChange` runs with the new texture
    // key when the sheet becomes ready.
    acquire(
        fileId: string | null,
        onChange: (textureKey: string) => void = () => {}
    ): AvatarTextureLease {
        if (fileId === null) return this.createGhostLease();

        const entry = this.ensureEntry(fileId);
        const textureKey = buildAvatarTextureKey(fileId);
        const listener = (): void => onChange(textureKey);
        entry.refs += 1;
        entry.listeners.add(listener);

        let isReleased = false;
        return {
            getKey: () =>
                entry.status === SHEET_STATUS.READY
                    ? textureKey
                    : AVATAR_GHOST_TEXTURE_KEY,
            release: () => {
                if (isReleased) return;
                isReleased = true;
                entry.listeners.delete(listener);
                entry.refs -= 1;
                if (entry.refs === 0) this.drop(fileId, entry);
            },
        };
    }

    private createGhostLease(): AvatarTextureLease {
        return {
            getKey: () => AVATAR_GHOST_TEXTURE_KEY,
            release: () => {},
        };
    }

    private ensureEntry(fileId: string): SheetEntry {
        const existing = this.entries.get(fileId);
        if (existing) return existing;

        const entry: SheetEntry = {
            status: SHEET_STATUS.LOADING,
            refs: 0,
            listeners: new Set(),
        };
        this.entries.set(fileId, entry);

        const key = buildAvatarTextureKey(fileId);
        ensureAvatarTexture(
            this.host,
            { key, url: this.resolveUrl(fileId) },
            {
                onReady: () => this.handleReady(fileId, entry),
                onError: () => this.handleError(fileId, entry),
            }
        );
        return entry;
    }

    private handleReady(fileId: string, entry: SheetEntry): void {
        const key = buildAvatarTextureKey(fileId);

        // Everyone let go while the sheet loaded. Another avatar may have asked
        // for it again meanwhile, and then the texture is theirs to use.
        if (this.entries.get(fileId) !== entry) {
            if (!this.entries.has(fileId)) this.destroyTexture(key);
            return;
        }

        registerAvatarAnimations(this.host, key);
        entry.status = SHEET_STATUS.READY;
        [...entry.listeners].forEach((listener) => listener());
    }

    private handleError(fileId: string, entry: SheetEntry): void {
        if (this.entries.get(fileId) !== entry) return;

        entry.status = SHEET_STATUS.FAILED;
        console.error(AVATAR_DIAGNOSTIC_MESSAGES.sheetLoadFailed(fileId));
    }

    // Last avatar let go: the sheet leaves the scene.
    private drop(fileId: string, entry: SheetEntry): void {
        if (this.entries.get(fileId) === entry) this.entries.delete(fileId);

        if (entry.status === SHEET_STATUS.READY) {
            this.destroyTexture(buildAvatarTextureKey(fileId));
        }
    }

    private destroyTexture(key: string): void {
        listAvatarAnimationKeys(key).forEach((animationKey) => {
            if (this.host.anims.exists(animationKey)) {
                this.host.anims.remove(animationKey);
            }
        });
        if (this.host.textures.exists(key)) this.host.textures.remove(key);
    }
}
