import type { GameRoom } from "@/features/game/types/room";

type Point = { x: number; y: number };

// The outline of a room in world pixels. A rectangle gives its four corners
// clockwise from the top left, a polygon is moved from room to world space.
export const getRoomPolygonPoints = (room: GameRoom): Point[] => {
    if (room.polygon && room.polygon.length > 0) {
        return room.polygon.map((point) => ({
            x: room.x + point.x,
            y: room.y + point.y,
        }));
    }
    return [
        { x: room.x, y: room.y },
        { x: room.x + room.width, y: room.y },
        { x: room.x + room.width, y: room.y + room.height },
        { x: room.x, y: room.y + room.height },
    ];
};
