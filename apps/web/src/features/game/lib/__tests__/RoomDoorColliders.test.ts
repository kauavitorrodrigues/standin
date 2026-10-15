import { describe, expect, it } from "vitest";
import { RoomDoorColliders } from "@/features/game/lib/RoomDoorColliders";
import type { GameRoomDoor } from "@/features/game/types/room";
import type { PlacedRect } from "@/features/game/utils/placed";

const door = (id: string, roomKey: string, x = 0): GameRoomDoor => ({
    id,
    roomKey,
    x,
    y: 0,
    width: 32,
    height: 32,
});

const setup = () => {
    const bodies = new Map<string, readonly PlacedRect[]>();
    const colliders = new RoomDoorColliders({
        set: (id, rects) => void bodies.set(id, rects),
        remove: (id) => void bodies.delete(id),
    });
    return { bodies, colliders };
};

describe("RoomDoorColliders", () => {
    it("has a body only for doors of a locked room", () => {
        const { bodies, colliders } = setup();
        colliders.setDoors([door("a", "r1"), door("b", "r2")]);
        colliders.setStates(
            new Map([
                ["r1", "locked"],
                ["r2", "closed"],
            ])
        );
        expect([...bodies.keys()]).toEqual(["a"]);
    });

    it("drops the body when the room is unlocked", () => {
        const { bodies, colliders } = setup();
        colliders.setDoors([door("a", "r1")]);
        colliders.setStates(new Map([["r1", "locked"]]));
        colliders.setStates(new Map([["r1", "open"]]));
        expect(bodies.size).toBe(0);
    });

    it("follows doors added, moved and removed", () => {
        const { bodies, colliders } = setup();
        colliders.setStates(new Map([["r1", "locked"]]));
        colliders.setDoors([door("a", "r1")]);
        expect(bodies.has("a")).toBe(true);
        colliders.setDoors([door("a", "r1", 64)]);
        expect(bodies.get("a")?.[0]?.x).toBe(64);
        colliders.setDoors([]);
        expect(bodies.size).toBe(0);
    });

    it("blocks the solid rects of a door when it has them, not its cell", () => {
        const { bodies, colliders } = setup();
        const trace = [{ x: 24, y: 0, width: 8, height: 32 }];
        colliders.setStates(new Map([["r1", "locked"]]));
        colliders.setDoors([{ ...door("a", "r1"), solidRects: trace }]);
        expect(bodies.get("a")).toEqual(trace);
    });

    it("rebuilds the body when the solid rects change and the cell does not", () => {
        const { bodies, colliders } = setup();
        colliders.setStates(new Map([["r1", "locked"]]));
        colliders.setDoors([
            {
                ...door("a", "r1"),
                solidRects: [{ x: 24, y: 0, width: 8, height: 32 }],
            },
        ]);
        colliders.setDoors([
            {
                ...door("a", "r1"),
                solidRects: [{ x: 0, y: 0, width: 8, height: 32 }],
            },
        ]);
        expect(bodies.get("a")?.[0]?.x).toBe(0);
    });

    it("keeps the whole cell for a door with no solid rects", () => {
        const { bodies, colliders } = setup();
        colliders.setStates(new Map([["r1", "locked"]]));
        colliders.setDoors([door("a", "r1")]);
        expect(bodies.get("a")).toEqual([
            { x: 0, y: 0, width: 32, height: 32 },
        ]);
    });
});
