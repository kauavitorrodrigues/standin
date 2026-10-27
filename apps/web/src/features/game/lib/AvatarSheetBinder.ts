import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import type { AvatarTextureLease } from "@/features/avatar/lib/AvatarTextureRegistry";

// What the binder needs from the registry, so it can run without a scene.
export type AvatarSheetSource = {
    acquire: (
        fileId: string | null,
        onChange: (textureKey: string) => void
    ) => AvatarTextureLease;
};

// What shows the sheet: the sprite of the local player or of a remote avatar.
export type AvatarSheetTarget = {
    setTexture: (textureKey: string) => void;
};

type Binding = {
    fileId: string | null;
    lease: AvatarTextureLease;
    // The lease of the sheet still on screen while the new one loads. It is
    // released once the new sheet is drawn.
    previous: AvatarTextureLease | null;
};

/**
 * Keeps each avatar of the scene on the sheet of its person. An avatar is
 * bound by an id of the caller (the local player, or the socket of a remote
 * one). Binding it again to another sheet swaps the sprite without touching
 * the scene, and letting it go releases the sheet so the registry can destroy
 * the texture when nobody else uses it.
 */
export class AvatarSheetBinder {
    private readonly source: AvatarSheetSource;
    private readonly bindings = new Map<string, Binding>();

    constructor(source: AvatarSheetSource) {
        this.source = source;
    }

    bind(id: string, target: AvatarSheetTarget, fileId: string | null): void {
        const current = this.bindings.get(id);
        if (current && current.fileId === fileId) return;

        // A swap that is not ready yet keeps drawing the texture of the
        // current sheet, so the sprite never flashes the ghost in between.
        // The new sheet is acquired before the old one is released, so a
        // sheet shared by both is never destroyed in between.
        const binding: Binding = {
            fileId,
            lease: this.source.acquire(fileId, (textureKey) => {
                target.setTexture(textureKey);
                this.releasePrevious(binding);
            }),
            previous: null,
        };
        const key = binding.lease.getKey();
        const isLoadingSwap =
            current !== undefined &&
            fileId !== null &&
            key === AVATAR_GHOST_TEXTURE_KEY;

        if (isLoadingSwap) {
            // What is on screen stays held. A swap still loading is replaced.
            binding.previous = current.previous ?? current.lease;
            if (current.previous) current.lease.release();
        } else {
            target.setTexture(key);
            current?.previous?.release();
            current?.lease.release();
        }
        this.bindings.set(id, binding);
    }

    // The sheet an avatar is bound to, undefined when it is not bound.
    getFileId(id: string): string | null | undefined {
        return this.bindings.get(id)?.fileId;
    }

    release(id: string): void {
        const binding = this.bindings.get(id);
        if (binding) this.releaseBinding(binding);
        this.bindings.delete(id);
    }

    releaseAll(): void {
        this.bindings.forEach((binding) => this.releaseBinding(binding));
        this.bindings.clear();
    }

    private releasePrevious(binding: Binding): void {
        binding.previous?.release();
        binding.previous = null;
    }

    private releaseBinding(binding: Binding): void {
        this.releasePrevious(binding);
        binding.lease.release();
    }
}
