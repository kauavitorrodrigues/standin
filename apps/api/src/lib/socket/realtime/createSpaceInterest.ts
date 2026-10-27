import {
    encodeEnteredPosition,
    encodePosition,
    type EnteredTuple,
    type PlayerPosition,
    type PositionTuple,
    type SpacePositionsPayload,
} from "@standin/contracts";
import { SpatialGrid } from "./SpatialGrid";

type Options = {
    // Who a person is told about, in world px.
    radius: number;
    // A person already told about stays so until past radius plus this.
    exitMargin: number;
};

export type SpaceInterest = {
    // Where a person is now. Only a person with a position is seen by others and
    // sees them, and one who never sent it is not part of the space yet.
    update: (socketId: string, position: PlayerPosition) => void;
    remove: (socketId: string) => void;
    has: (socketId: string) => boolean;
    get: (socketId: string) => PlayerPosition | undefined;
    // The sockets within `radius` of a person, the person left out.
    neighbors: (socketId: string, radius: number) => string[];
    // Every socket within `radius` of a point, the one at the point included.
    query: (x: number, y: number, radius: number) => string[];
    // What each person has to hear since the last flush: the ones who came into
    // sight, the known ones who changed, and the ones who went out. A person
    // with nothing to hear is not in the result.
    flush: () => Map<string, SpacePositionsPayload>;
    hasPending: () => boolean;
    isEmpty: () => boolean;
};

// The interest of one space: who sees whom, kept as positions come in and
// turned into one small message per person each tick.
export const createSpaceInterest = ({
    radius,
    exitMargin,
}: Options): SpaceInterest => {
    const positions = new Map<string, PlayerPosition>();
    const grid = new SpatialGrid(radius);
    // What each person was told about, so only the difference is sent.
    const known = new Map<string, Set<string>>();
    const dirty = new Set<string>();
    // The short id each person goes by on the wire inside this space. Never
    // reused while the space lives, so a late message cannot name someone else.
    const shortIds = new Map<string, number>();
    // Ids of who just left, kept until the flush that tells the others.
    const retiredIds = new Map<string, number>();
    let nextShortId = 1;
    // Reused by every receiver of a flush instead of a new Set each time.
    const withinMargin = new Set<string>();
    // Someone left, so a person who was told about them has to hear it even if
    // nobody moved.
    let structuralChange = false;

    const shortIdOf = (socketId: string): number | undefined =>
        shortIds.get(socketId) ?? retiredIds.get(socketId);

    const encode = (socketId: string): PositionTuple | null => {
        const position = positions.get(socketId);
        const shortId = shortIds.get(socketId);
        if (!position || shortId === undefined) return null;
        return encodePosition(shortId, position);
    };

    const encodeEntered = (socketId: string): EnteredTuple | null => {
        const position = positions.get(socketId);
        const shortId = shortIds.get(socketId);
        if (!position || shortId === undefined) return null;
        return encodeEnteredPosition(shortId, socketId, position);
    };

    const update: SpaceInterest["update"] = (socketId, position) => {
        const previous = positions.get(socketId);
        if (
            previous &&
            previous.x === position.x &&
            previous.y === position.y &&
            previous.direction === position.direction &&
            previous.isSitting === position.isSitting
        ) {
            return;
        }

        if (!shortIds.has(socketId)) {
            const retired = retiredIds.get(socketId);
            retiredIds.delete(socketId);
            shortIds.set(socketId, retired ?? nextShortId++);
        }
        positions.set(socketId, position);
        grid.set(socketId, position.x, position.y);
        dirty.add(socketId);
    };

    const remove: SpaceInterest["remove"] = (socketId) => {
        if (!positions.delete(socketId)) {
            known.delete(socketId);
            return;
        }

        grid.remove(socketId);
        known.delete(socketId);
        dirty.delete(socketId);
        const shortId = shortIds.get(socketId);
        if (shortId !== undefined) retiredIds.set(socketId, shortId);
        shortIds.delete(socketId);
        structuralChange = true;
    };

    const neighbors: SpaceInterest["neighbors"] = (socketId, reach) => {
        const spot = grid.get(socketId);
        if (!spot) return [];

        return grid
            .query(spot.x, spot.y, reach)
            .filter((candidate) => candidate !== socketId);
    };

    const flushFor = (
        receiverId: string,
        receiverSpot: { x: number; y: number }
    ): SpacePositionsPayload | null => {
        const heard = known.get(receiverId) ?? new Set<string>();
        known.set(receiverId, heard);

        const entered: EnteredTuple[] = [];
        const moved: PositionTuple[] = [];
        const left: number[] = [];

        withinMargin.clear();
        const nearby = grid.query(
            receiverSpot.x,
            receiverSpot.y,
            radius + exitMargin
        );
        nearby.forEach((candidate) => {
            if (candidate !== receiverId) withinMargin.add(candidate);
        });

        withinMargin.forEach((candidate) => {
            if (heard.has(candidate)) {
                const tuple = dirty.has(candidate) ? encode(candidate) : null;
                if (tuple) moved.push(tuple);
                return;
            }

            const spot = grid.get(candidate);
            if (!spot) return;
            const dx = spot.x - receiverSpot.x;
            const dy = spot.y - receiverSpot.y;
            if (dx * dx + dy * dy > radius * radius) return;

            const tuple = encodeEntered(candidate);
            if (!tuple) return;
            heard.add(candidate);
            entered.push(tuple);
        });

        heard.forEach((candidate) => {
            if (withinMargin.has(candidate)) return;
            heard.delete(candidate);
            const shortId = shortIdOf(candidate);
            if (shortId !== undefined) left.push(shortId);
        });

        if (entered.length === 0 && moved.length === 0 && left.length === 0) {
            return null;
        }
        return { entered, moved, left };
    };

    const flush: SpaceInterest["flush"] = () => {
        const result = new Map<string, SpacePositionsPayload>();
        if (dirty.size === 0 && !structuralChange) return result;

        positions.forEach((_position, receiverId) => {
            const receiverSpot = grid.get(receiverId);
            if (!receiverSpot) return;

            const payload = flushFor(receiverId, receiverSpot);
            if (payload) result.set(receiverId, payload);
        });

        dirty.clear();
        retiredIds.clear();
        structuralChange = false;
        return result;
    };

    return {
        update,
        remove,
        has: (socketId) => positions.has(socketId),
        get: (socketId) => positions.get(socketId),
        neighbors,
        query: (x, y, reach) => grid.query(x, y, reach),
        flush,
        hasPending: () => dirty.size > 0 || structuralChange,
        isEmpty: () => positions.size === 0,
    };
};
