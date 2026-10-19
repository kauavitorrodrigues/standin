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

        // The new sheet is acquired before the old one is released, so a sheet
        // shared by both is never destroyed in between.
        const lease = this.source.acquire(fileId, (textureKey) =>
            target.setTexture(textureKey)
        );
        target.setTexture(lease.getKey());
        current?.lease.release();
        this.bindings.set(id, { fileId, lease });
    }

    // The sheet an avatar is bound to, undefined when it is not bound.
    getFileId(id: string): string | null | undefined {
        return this.bindings.get(id)?.fileId;
    }

    release(id: string): void {
        this.bindings.get(id)?.lease.release();
        this.bindings.delete(id);
    }

    releaseAll(): void {
        this.bindings.forEach((binding) => binding.lease.release());
        this.bindings.clear();
    }
}
