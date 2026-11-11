import type {
    SpaceActiveObject,
    SpaceActiveObjectPayload,
} from "@standin/contracts";
import type { WebsiteViewersState } from "../types/viewers";

export const EMPTY_VIEWERS: WebsiteViewersState = new Map();

// The server tells who has what on a join, and that is the whole truth.
export const replaceViewers = (
    snapshot: readonly SpaceActiveObject[]
): WebsiteViewersState =>
    new Map(
        snapshot.map(({ socketId, userId, objectId }) => [
            socketId,
            { userId, objectId },
        ])
    );

// A person opened an object or closed the one they had.
export const applyActiveObject = (
    state: WebsiteViewersState,
    { socketId, userId, objectId }: SpaceActiveObjectPayload
): WebsiteViewersState => {
    const next = new Map(state);
    if (objectId === null) next.delete(socketId);
    else next.set(socketId, { userId, objectId });
    return next;
};

// Somebody closed the object for everyone looking at it.
export const applyObjectClosed = (
    state: WebsiteViewersState,
    objectId: string
): WebsiteViewersState =>
    new Map([...state].filter(([, entry]) => entry.objectId !== objectId));

export const applyPeerLeft = (
    state: WebsiteViewersState,
    socketId: string
): WebsiteViewersState => {
    if (!state.has(socketId)) return state;

    const next = new Map(state);
    next.delete(socketId);
    return next;
};

/**
 * The people looking at an object, one entry each however many tabs they have,
 * the local person first. The server does not tell a connection about itself,
 * so the local person is added when they are looking.
 */
export const listViewerIds = (
    state: WebsiteViewersState,
    objectId: string,
    selfUserId: string,
    isSelfViewing: boolean
): string[] => {
    const others = [...state.values()]
        .filter((entry) => entry.objectId === objectId)
        .map((entry) => entry.userId)
        .filter((userId) => userId !== selfUserId);
    const unique = [...new Set(others)];
    return isSelfViewing ? [selfUserId, ...unique] : unique;
};
