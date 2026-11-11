import type {
    CreateRemoteOutline,
    OutlineHandle,
} from "@/features/game/types/remoteOutlines";

// The outline of the avatars of the other people, for the one the mouse is on
// and the one that was clicked. An outline exists only while it is shown, so a
// room full of people holds at most two. It allocates nothing in a frame where
// nothing changes.
export class RemoteAvatarOutlines {
    private readonly create: CreateRemoteOutline;
    private readonly outlines = new Map<string, OutlineHandle>();

    constructor(create: CreateRemoteOutline) {
        this.create = create;
    }

    // Called every frame with the socket id of the hovered and the selected
    // avatar, or null for none.
    update(hoveredId: string | null, selectedId: string | null): void {
        this.outlines.forEach((outline, socketId) => {
            if (socketId === hoveredId || socketId === selectedId) return;

            outline.destroy();
            this.outlines.delete(socketId);
        });

        this.show(hoveredId);
        if (selectedId !== hoveredId) this.show(selectedId);
    }

    // The avatar is about to go, so its outline goes before it.
    release(socketId: string): void {
        this.outlines.get(socketId)?.destroy();
        this.outlines.delete(socketId);
    }

    destroy(): void {
        this.outlines.forEach((outline) => outline.destroy());
        this.outlines.clear();
    }

    private show(socketId: string | null): void {
        if (socketId === null) return;

        const outline = this.outlines.get(socketId) ?? this.make(socketId);
        outline?.update(true);
    }

    private make(socketId: string): OutlineHandle | null {
        const outline = this.create(socketId);
        if (outline) this.outlines.set(socketId, outline);
        return outline;
    }
}
