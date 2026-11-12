import type {
    AnnounceableAvailability,
    CustomStatus,
} from "@standin/contracts";

// What a person says about themselves: whether they are away and what they
// are up to.
export type PresenceStatus = {
    availability: AnnounceableAvailability;
    customStatus: CustomStatus | null;
};

export type PresenceEntry = {
    socketId: string;
    userId: string;
    name: string;
    // The photo of the profile, null when the person has none.
    profilePictureUrl: string | null;
    // The sheet the avatar is drawn with, null for the ghost.
    avatarSheetFileId: string | null;
    // Whether the microphone is muted. Starts muted until the person says so.
    muted: boolean;
    // Whether the person has headphones on, and talks to nobody.
    headphones: boolean;
    // Whether the person is in focus mode.
    focus: boolean;
    // Away or active, as the person said. Busy is the headphones above. Memory
    // only: the device sends it again on every join.
    availability: AnnounceableAvailability;
    // What the person is up to, or null. Memory only, like the availability.
    customStatus: CustomStatus | null;
    // When the person started announcing, in ms since the epoch, or null when
    // they are not. It lives only in memory, like the rest of the presence.
    announcingSince: number | null;
    // When the person started showing their camera to whoever announces near
    // them, or null when they do not. Memory only.
    sharingVideoWithAnnouncerSince: number | null;
    // When the person raised a hand, in ms since the epoch, or null when the
    // hand is down. Memory only, like the rest of the presence.
    handRaisedSince: number | null;
    // The object the person has open, such as an embedded website, or null when
    // they have none. Not tied to sitting. Memory only.
    activeInteractionObjectId: string | null;
};

export type PresenceProfile = Pick<
    PresenceEntry,
    "name" | "profilePictureUrl"
>;

type SpacePresence = {
    bySocket: Map<string, PresenceEntry>;
    // Every connection of a person in the space, since one account may hold
    // several tabs for a moment.
    byUser: Map<string, Set<string>>;
};

// Who is in each space, kept in memory and filled once, when a socket joins.
// Joining, sending a snapshot and telling a space about a change read from
// here, so none of them goes to the database for the people already inside.
const spaces = new Map<string, SpacePresence>();

const readSpace = (spaceId: string) => spaces.get(spaceId);

const ensureSpace = (spaceId: string): SpacePresence => {
    const existing = spaces.get(spaceId);
    if (existing) return existing;

    const created: SpacePresence = {
        bySocket: new Map(),
        byUser: new Map(),
    };
    spaces.set(spaceId, created);
    return created;
};

const indexUser = (space: SpacePresence, entry: PresenceEntry) => {
    const sockets = space.byUser.get(entry.userId) ?? new Set<string>();
    sockets.add(entry.socketId);
    space.byUser.set(entry.userId, sockets);
};

const unindexUser = (space: SpacePresence, entry: PresenceEntry) => {
    const sockets = space.byUser.get(entry.userId);
    if (!sockets) return;
    sockets.delete(entry.socketId);
    if (sockets.size === 0) space.byUser.delete(entry.userId);
};

const add = (spaceId: string, entry: PresenceEntry) => {
    const space = ensureSpace(spaceId);
    const previous = space.bySocket.get(entry.socketId);
    if (previous) unindexUser(space, previous);

    space.bySocket.set(entry.socketId, entry);
    indexUser(space, entry);
};

const remove = (
    spaceId: string,
    socketId: string
): PresenceEntry | undefined => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return undefined;

    space.bySocket.delete(socketId);
    unindexUser(space, entry);
    if (space.bySocket.size === 0) spaces.delete(spaceId);
    return entry;
};

const list = (spaceId: string): PresenceEntry[] => [
    ...(readSpace(spaceId)?.bySocket.values() ?? []),
];

const get = (spaceId: string, socketId: string): PresenceEntry | undefined =>
    readSpace(spaceId)?.bySocket.get(socketId);

const findSocketIdsOfUser = (spaceId: string, userId: string): string[] => [
    ...(readSpace(spaceId)?.byUser.get(userId) ?? []),
];

const findSpaceIdsOfUser = (userId: string): string[] =>
    [...spaces.entries()]
        .filter(([, space]) => space.byUser.has(userId))
        .map(([spaceId]) => spaceId);

// The spaces with at least one person inside.
const listSpaceIds = (): string[] => [...spaces.keys()];

// The people inside a space, one id each, however many tabs they hold.
const listUserIds = (spaceId: string): string[] => [
    ...(readSpace(spaceId)?.byUser.keys() ?? []),
];

const size = (spaceId: string): number =>
    readSpace(spaceId)?.bySocket.size ?? 0;

// Applies a change to every connection of a person, in every space they are
// in, and returns those spaces so the caller can tell each one.
const updateUser = (
    userId: string,
    patch: Partial<Omit<PresenceEntry, "socketId" | "userId">>
): string[] => {
    const spaceIds = findSpaceIdsOfUser(userId);
    spaceIds.forEach((spaceId) => {
        const space = readSpace(spaceId);
        space?.byUser.get(userId)?.forEach((socketId) => {
            const entry = space.bySocket.get(socketId);
            if (entry) space.bySocket.set(socketId, { ...entry, ...patch });
        });
    });
    return spaceIds;
};

// Drops a socket from every space it could be in, for one that went away
// before the join gave it a space.
const removeSocketEverywhere = (socketId: string): void => {
    [...spaces.keys()].forEach((spaceId) => remove(spaceId, socketId));
};

// Returns whether the state changed.
const setMuted = (
    spaceId: string,
    socketId: string,
    muted: boolean
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry || entry.muted === muted) return false;

    space.bySocket.set(socketId, { ...entry, muted });
    return true;
};

// Returns whether the state changed.
const setPrivacy = (
    spaceId: string,
    socketId: string,
    privacy: Pick<PresenceEntry, "headphones" | "focus">
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if (
        entry.headphones === privacy.headphones &&
        entry.focus === privacy.focus
    ) {
        return false;
    }

    space.bySocket.set(socketId, { ...entry, ...privacy });
    return true;
};

const isSameCustomStatus = (
    a: CustomStatus | null,
    b: CustomStatus | null
): boolean => {
    if (a === null || b === null) return a === b;
    return (
        a.text === b.text && a.emoji === b.emoji && a.expiresAt === b.expiresAt
    );
};

// Returns whether the state changed.
const setStatus = (
    spaceId: string,
    socketId: string,
    status: PresenceStatus
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if (
        entry.availability === status.availability &&
        isSameCustomStatus(entry.customStatus, status.customStatus)
    ) {
        return false;
    }

    space.bySocket.set(socketId, { ...entry, ...status });
    return true;
};

// Drops the custom status once its time is up and returns the entry, or
// undefined when there was nothing to drop. The end is compared, so a status
// the person replaced in the meantime is left alone.
const expireCustomStatus = (
    spaceId: string,
    socketId: string,
    expiresAt: number
): PresenceEntry | undefined => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry || entry.customStatus?.expiresAt !== expiresAt) {
        return undefined;
    }

    const next = { ...entry, customStatus: null };
    space.bySocket.set(socketId, next);
    return next;
};

// Returns whether the state changed. Announcing again keeps the first start,
// so the order of the announcers does not change under a repeated request.
const setAnnouncing = (
    spaceId: string,
    socketId: string,
    announcingSince: number | null
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if ((entry.announcingSince === null) === (announcingSince === null)) {
        return false;
    }

    space.bySocket.set(socketId, { ...entry, announcingSince });
    return true;
};

// Returns whether the state changed. Sharing again keeps the first start.
const setSharingVideoWithAnnouncer = (
    spaceId: string,
    socketId: string,
    sharingSince: number | null
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if (
        (entry.sharingVideoWithAnnouncerSince === null) ===
        (sharingSince === null)
    ) {
        return false;
    }

    space.bySocket.set(socketId, {
        ...entry,
        sharingVideoWithAnnouncerSince: sharingSince,
    });
    return true;
};

// Returns whether the state changed. Raising again keeps the first time, so
// the order of the hands does not change under a repeated request.
const setHandRaised = (
    spaceId: string,
    socketId: string,
    handRaisedSince: number | null
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if ((entry.handRaisedSince === null) === (handRaisedSince === null)) {
        return false;
    }

    space.bySocket.set(socketId, { ...entry, handRaisedSince });
    return true;
};

// Returns whether the state changed.
const setActiveObject = (
    spaceId: string,
    socketId: string,
    objectId: string | null
): boolean => {
    const space = readSpace(spaceId);
    const entry = space?.bySocket.get(socketId);
    if (!space || !entry) return false;
    if (entry.activeInteractionObjectId === objectId) return false;

    space.bySocket.set(socketId, {
        ...entry,
        activeInteractionObjectId: objectId,
    });
    return true;
};

// Who has an object open in the space.
const listActiveObjects = (spaceId: string): PresenceEntry[] =>
    list(spaceId).filter((entry) => entry.activeInteractionObjectId !== null);

// Takes the object away from everyone who has it open and returns who they
// were, so the caller can tell the space.
const clearActiveObject = (
    spaceId: string,
    objectId: string
): PresenceEntry[] => {
    const viewers = list(spaceId).filter(
        (entry) => entry.activeInteractionObjectId === objectId
    );
    viewers.forEach((entry) => setActiveObject(spaceId, entry.socketId, null));
    return viewers;
};

// Who has a hand up in the space, the oldest first.
const listRaisedHands = (spaceId: string): PresenceEntry[] =>
    list(spaceId)
        .filter((entry) => entry.handRaisedSince !== null)
        .sort((a, b) => (a.handRaisedSince ?? 0) - (b.handRaisedSince ?? 0));

// Who is announcing in the space, the oldest first.
const listAnnouncers = (spaceId: string): PresenceEntry[] =>
    list(spaceId)
        .filter((entry) => entry.announcingSince !== null)
        .sort((a, b) => (a.announcingSince ?? 0) - (b.announcingSince ?? 0));

const clear = () => spaces.clear();

export const PresenceStore = {
    add,
    remove,
    removeSocketEverywhere,
    list,
    get,
    size,
    findSocketIdsOfUser,
    findSpaceIdsOfUser,
    listSpaceIds,
    listUserIds,
    updateUser,
    setMuted,
    setPrivacy,
    setStatus,
    expireCustomStatus,
    setAnnouncing,
    setSharingVideoWithAnnouncer,
    setHandRaised,
    setActiveObject,
    listActiveObjects,
    clearActiveObject,
    listRaisedHands,
    listAnnouncers,
    clear,
};
