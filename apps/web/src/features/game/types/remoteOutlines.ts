// The part of an outline the manager needs: draw it or not, and let it go.
export type OutlineHandle = {
    update: (isVisible: boolean) => void;
    destroy: () => void;
};

// Makes the outline of the avatar of a peer, or nothing when that avatar is
// gone.
export type CreateRemoteOutline = (socketId: string) => OutlineHandle | null;
