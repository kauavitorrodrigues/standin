import {
    LISTENING_PAUSE_LIMIT_MS,
    SpaceEvents,
    type ListeningEntry,
    type ListeningTrack,
    type SpaceMusicListeningPayload,
} from "@standin/contracts";
import { SocketManager } from "../../socketManager";
import { buildSpaceRoom } from "../../utils/buildSpaceRoom";
import type { ShownState } from "./types";
import { hasTrackChanged } from "./utils/hasTrackChanged";
import { resolveShownTrack } from "./utils/resolveShownTrack";

// What is shown of each person, by space. It lives in memory like the
// presence: a restart starts empty and the next poll fills it again.
const shown = new Map<string, Map<string, ShownState>>();

// A person with nothing shown and no pause to remember needs no entry.
const isEmptyState = ({ visible, trackId }: ShownState) =>
    visible === null && trackId === null;

const snapshot = (spaceId: string): ListeningEntry[] =>
    [...(shown.get(spaceId) ?? [])].flatMap(([userId, state]) =>
        state.visible ? [{ userId, track: state.visible }] : []
    );

const emit = (
    spaceId: string,
    userId: string,
    track: ListeningTrack | null
) => {
    SocketManager.emitToRoom(
        buildSpaceRoom(spaceId),
        SpaceEvents.SPACE_MUSIC_LISTENING,
        { userId, track } satisfies SpaceMusicListeningPayload
    );
};

// Takes what a poll found and tells the space only when it changed.
const update = (
    spaceId: string,
    userId: string,
    track: ListeningTrack | null,
    now: number
): void => {
    const users = shown.get(spaceId) ?? new Map<string, ShownState>();
    const previous = users.get(userId) ?? null;
    const next = resolveShownTrack({
        track,
        previous,
        now,
        pauseLimitMs: LISTENING_PAUSE_LIMIT_MS,
    });

    if (isEmptyState(next)) {
        users.delete(userId);
    } else {
        users.set(userId, next);
    }
    if (users.size > 0) shown.set(spaceId, users);
    if (users.size === 0) shown.delete(spaceId);

    if (hasTrackChanged(previous?.visible ?? null, next.visible)) {
        emit(spaceId, userId, next.visible);
    }
};

const clearUser = (spaceId: string, userId: string): void =>
    update(spaceId, userId, null, Date.now());

const listUserIds = (spaceId: string): string[] => [
    ...(shown.get(spaceId)?.keys() ?? []),
];

// A space with nobody inside has nobody to tell: its state is dropped.
const prune = (activeSpaceIds: string[]): void => {
    const active = new Set(activeSpaceIds);
    [...shown.keys()]
        .filter((spaceId) => !active.has(spaceId))
        .forEach((spaceId) => shown.delete(spaceId));
};

const clear = (): void => shown.clear();

export const ListeningSync = {
    snapshot,
    update,
    clearUser,
    listUserIds,
    prune,
    clear,
};
