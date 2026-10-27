import {
    decodePosition,
    type PlayerPosition,
    type RemotePlayer,
    type SpacePositionsPayload,
} from "@standin/contracts";

export type SpacePositionsTarget = {
    removeRemoteAvatar: (socketId: string) => void;
    spawnRemoteAvatar: (
        socketId: string,
        userId: string,
        avatarSheetFileId: RemotePlayer["avatarSheetFileId"],
        profile: { name: string; profilePictureUrl: RemotePlayer["profilePictureUrl"] }
    ) => void;
    applyRemotePosition: (socketId: string, position: PlayerPosition) => void;
};

// What this client knows about the people around it, kept apart from the scene
// so a message that arrives before the scene is ready is not lost.
export type SpacePositionsState = {
    // Which socket each short id of `space:positions` stands for.
    shortIds: Map<number, string>;
    // Everyone in the space, as the server told it.
    roster: Map<string, RemotePlayer>;
    // Who is in sight, and where they were last seen.
    inSight: Map<string, PlayerPosition>;
};

export const createSpacePositionsState = (): SpacePositionsState => ({
    shortIds: new Map(),
    roster: new Map(),
    inSight: new Map(),
});

const drawOne = (
    state: SpacePositionsState,
    socketId: string,
    position: PlayerPosition,
    target: SpacePositionsTarget
): void => {
    const peer = state.roster.get(socketId);
    if (!peer) return;

    target.spawnRemoteAvatar(socketId, peer.userId, peer.avatarSheetFileId, {
        name: peer.name,
        profilePictureUrl: peer.profilePictureUrl,
    });
    target.applyRemotePosition(socketId, position);
};

// Draws everyone who is in sight and has a roster entry. It runs when the scene
// becomes ready and when someone joins, and drawing twice changes nothing.
export const drawInSight = (
    state: SpacePositionsState,
    target: SpacePositionsTarget
): void => {
    state.inSight.forEach((position, socketId) =>
        drawOne(state, socketId, position, target)
    );
};

// Applies one `space:positions` message. People are named by a short id, and
// `state.shortIds` is what this client learned from `entered`. A short id never
// heard about is skipped, as the person was never in sight. With no target (the
// scene is not ready) the state is still updated, and `drawInSight` draws it
// later.
export const applySpacePositions = (
    { entered, moved, left }: SpacePositionsPayload,
    state: SpacePositionsState,
    target: SpacePositionsTarget | null
): void => {
    left.forEach((shortId) => {
        const socketId = state.shortIds.get(shortId);
        if (socketId === undefined) return;

        state.shortIds.delete(shortId);
        state.inSight.delete(socketId);
        target?.removeRemoteAvatar(socketId);
    });

    entered.forEach((tuple) => {
        const socketId = tuple[4];
        const { shortId, position } = decodePosition(tuple);
        state.shortIds.set(shortId, socketId);
        state.inSight.set(socketId, position);
        if (target) drawOne(state, socketId, position, target);
    });

    moved.forEach((tuple) => {
        const { shortId, position } = decodePosition(tuple);
        const socketId = state.shortIds.get(shortId);
        if (socketId === undefined) return;

        state.inSight.set(socketId, position);
        target?.applyRemotePosition(socketId, position);
    });
};
