export type PresenceEntry = {
    socketId: string;
    userId: string;
    name: string;
    // The photo of the profile, null when the person has none.
    profilePictureUrl: string | null;
    // The sheet the avatar is drawn with, null for the ghost.
    avatarSheetFileId: string | null;
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
    updateUser,
    clear,
};
