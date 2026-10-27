import {
    SPACE_AOI_EXIT_MARGIN_PX,
    SPACE_AOI_RADIUS_PX,
    type PlayerPosition,
    type SpacePositionsPayload,
} from "@standin/contracts";
import { createSpaceInterest, type SpaceInterest } from "./createSpaceInterest";

// The interest of every space that has someone with a position in it, built
// when the first position comes in and dropped when the last one leaves.
const spaces = new Map<string, SpaceInterest>();

const ensure = (spaceId: string): SpaceInterest => {
    const existing = spaces.get(spaceId);
    if (existing) return existing;

    const created = createSpaceInterest({
        radius: SPACE_AOI_RADIUS_PX,
        exitMargin: SPACE_AOI_EXIT_MARGIN_PX,
    });
    spaces.set(spaceId, created);
    return created;
};

const update = (
    spaceId: string,
    socketId: string,
    position: PlayerPosition
): void => ensure(spaceId).update(socketId, position);

const remove = (spaceId: string, socketId: string): void => {
    const space = spaces.get(spaceId);
    if (!space) return;

    space.remove(socketId);
    // Kept until the pending message about the departure was flushed.
    if (space.isEmpty() && !space.hasPending()) spaces.delete(spaceId);
};

const neighbors = (
    spaceId: string,
    socketId: string,
    radius: number
): string[] => spaces.get(spaceId)?.neighbors(socketId, radius) ?? [];

const get = (spaceId: string, socketId: string): PlayerPosition | undefined =>
    spaces.get(spaceId)?.get(socketId);

// Read side for the media planner: where a socket is and who is near a point.
const indexOf = (spaceId: string) => ({
    get: (socketId: string) => spaces.get(spaceId)?.get(socketId),
    query: (x: number, y: number, radius: number) =>
        spaces.get(spaceId)?.query(x, y, radius) ?? [],
});

// One tick: every space with something pending says what each person has to
// hear. A space left empty by the tick is forgotten.
const flushAll = (
    send: (
        spaceId: string,
        socketId: string,
        payload: SpacePositionsPayload
    ) => void
): void => {
    spaces.forEach((space, spaceId) => {
        if (!space.hasPending()) return;

        space.flush().forEach((payload, socketId) => {
            send(spaceId, socketId, payload);
        });
        if (space.isEmpty()) spaces.delete(spaceId);
    });
};

const clear = (): void => spaces.clear();

export const SpaceInterests = {
    update,
    remove,
    neighbors,
    get,
    indexOf,
    flushAll,
    clear,
};
