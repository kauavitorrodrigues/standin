import { TILE_SIZE } from "../consts/constants";
import { LAYOUT_ZONE_KINDS } from "../schemas/layout.schema";
import type { Zone } from "./zone";

// A door footprint in pixels, top left corner.
export type DoorRect = { x: number; y: number; width: number; height: number };

export type DoorRoomMatch =
    | { status: "room"; roomKey: string }
    | { status: "none" }
    | { status: "ambiguous"; roomKeys: string[] };

// How far from the edge of a room a door can sit and still belong to it. A
// door stands in the wall, which is the border of the zone, so it can be a
// little inside or a little outside of the drawn shape.
export const DOOR_ROOM_REACH = TILE_SIZE;

// Which room (`private` zone) a door belongs to, from where it stands.
// A door that reaches no room is `none`, and one that reaches more than one
// is `ambiguous`, since it would close two rooms at once.
export const findDoorRoom = (
    door: DoorRect,
    zones: readonly Zone[]
): DoorRoomMatch => {
    const roomKeys = zones
        .filter(
            (zone) =>
                zone.kind === LAYOUT_ZONE_KINDS.PRIVATE &&
                zone.key !== undefined &&
                doorReachesZone(door, zone)
        )
        .map((zone) => zone.key as string);

    switch (roomKeys.length) {
        case 0:
            return { status: "none" };
        case 1:
            return { status: "room", roomKey: roomKeys[0] as string };
        default:
            return { status: "ambiguous", roomKeys };
    }
};

type Point = { x: number; y: number };

// A door reaches a zone when its footprint comes within DOOR_ROOM_REACH of the
// zone border, which is the outline of the rectangle or of the polygon.
const doorReachesZone = (door: DoorRect, zone: Zone): boolean =>
    getZoneOutline(zone).some(
        ([from, to]) => distanceRectToSegment(door, from, to) <= DOOR_ROOM_REACH
    );

// The edges of the zone in world pixels. Polygon points are relative to the
// zone x and y.
const getZoneOutline = (zone: Zone): [Point, Point][] => {
    const corners: Point[] = zone.polygon
        ? zone.polygon.map((point) => ({
              x: zone.x + point.x,
              y: zone.y + point.y,
          }))
        : [
              { x: zone.x, y: zone.y },
              { x: zone.x + zone.width, y: zone.y },
              { x: zone.x + zone.width, y: zone.y + zone.height },
              { x: zone.x, y: zone.y + zone.height },
          ];

    return corners.map((corner, index) => [
        corner,
        corners[(index + 1) % corners.length] as Point,
    ]);
};

const distanceRectToSegment = (
    rect: DoorRect,
    from: Point,
    to: Point
): number => {
    const corners: Point[] = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
    ];

    const crosses = corners.some((corner, index) =>
        segmentsIntersect(
            from,
            to,
            corner,
            corners[(index + 1) % corners.length] as Point
        )
    );
    if (crosses || isInsideRect(rect, from) || isInsideRect(rect, to)) {
        return 0;
    }

    return Math.min(
        distancePointToRect(rect, from),
        distancePointToRect(rect, to),
        ...corners.map((corner) => distancePointToSegment(corner, from, to))
    );
};

const isInsideRect = (rect: DoorRect, point: Point): boolean =>
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height;

const distancePointToRect = (rect: DoorRect, point: Point): number => {
    const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
    const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));

    return Math.hypot(dx, dy);
};

const distancePointToSegment = (
    point: Point,
    from: Point,
    to: Point
): number => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0)
        return Math.hypot(point.x - from.x, point.y - from.y);

    const t = Math.max(
        0,
        Math.min(
            1,
            ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared
        )
    );

    return Math.hypot(point.x - (from.x + t * dx), point.y - (from.y + t * dy));
};

const cross = (a: Point, b: Point, c: Point): number =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

// Proper crossing only. Touching cases are covered by the point distances.
const segmentsIntersect = (a: Point, b: Point, c: Point, d: Point): boolean =>
    cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
