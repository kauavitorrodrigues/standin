import type { GameRoom } from "@/features/game/types/room";

type Point = { x: number; y: number };

// Even odd rule, with the points of the polygon relative to the room.
const isInsidePolygon = (
    polygon: readonly Point[],
    x: number,
    y: number
): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i]!;
        const b = polygon[j]!;
        const crosses =
            a.y > y !== b.y > y &&
            x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x;
        if (crosses) inside = !inside;
    }
    return inside;
};

export const isInsideRoom = (room: GameRoom, point: Point): boolean => {
    if (room.polygon && room.polygon.length >= 3) {
        return isInsidePolygon(
            room.polygon,
            point.x - room.x,
            point.y - room.y
        );
    }

    return (
        point.x >= room.x &&
        point.x < room.x + room.width &&
        point.y >= room.y &&
        point.y < room.y + room.height
    );
};

// The room whose shape holds the point, or null when it is outside all of them.
// A plain loop, since this runs for every remote avatar every frame and a
// `find` would build a closure each time.
export const getRoomAt = (
    rooms: readonly GameRoom[],
    point: Point
): GameRoom | null => {
    for (let index = 0; index < rooms.length; index += 1) {
        const room = rooms[index]!;
        if (isInsideRoom(room, point)) return room;
    }
    return null;
};
