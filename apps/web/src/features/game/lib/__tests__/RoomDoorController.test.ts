import { describe, expect, it } from "vitest";
import type { RoomCrossDirection, RoomDoorState } from "@standin/contracts";
import { RoomDoorController } from "@/features/game/lib/RoomDoorController";
import type { GameRoom, GameRoomDoor } from "@/features/game/types/room";

const room: GameRoom = {
    key: "r",
    label: "R",
    x: 100,
    y: 100,
    width: 100,
    height: 100,
};
const door: GameRoomDoor = {
    id: "d",
    roomKey: "r",
    x: 90,
    y: 140,
    width: 20,
    height: 20,
};

const setup = (state: RoomDoorState = "open") => {
    const player = { x: 50, y: 150 };
    const crossings: [string, RoomCrossDirection][] = [];
    const steps: string[] = [];
    const present: string[] = [];
    const controller = new RoomDoorController(player, {
        onPresent: (key) => present.push(key),
        onCrossed: (key, direction) => crossings.push([key, direction]),
        onStepOnDoor: (key) => steps.push(key),
    });
    controller.setRooms([room]);
    controller.setDoors([door]);
    controller.setStates(new Map([["r", state]]));
    controller.update();
    return { player, crossings, steps, present, controller };
};

describe("RoomDoorController crossings", () => {
    it("reports in and out only on a change of side", () => {
        const { player, crossings, controller } = setup();
        player.x = 150;
        controller.update();
        controller.update();
        expect(crossings).toEqual([["r", "in"]]);
        player.x = 50;
        controller.update();
        expect(crossings).toEqual([
            ["r", "in"],
            ["r", "out"],
        ]);
    });

    it("does not report the room the avatar starts in", () => {
        const { player, crossings, controller } = setup();
        player.x = 150;
        controller.setRooms([room]);
        controller.update();
        expect(crossings).toEqual([]);
        expect(controller.getRoomKey()).toBe("r");
    });
});

describe("RoomDoorController presence", () => {
    it("reports the room it starts in, without a crossing", () => {
        const { player, crossings, present, controller } = setup();
        expect(present).toEqual([]);
        player.x = 150;
        controller.setRooms([room]);
        controller.update();
        expect(present).toEqual(["r"]);
        expect(crossings).toEqual([]);
    });

    it("reports nothing outside a room and again on request", () => {
        const { player, present, controller } = setup();
        controller.reportPresence();
        expect(present).toEqual([]);
        player.x = 150;
        controller.update();
        controller.reportPresence();
        expect(present).toEqual(["r"]);
    });
});

describe("RoomDoorController door steps", () => {
    it("reports once per entry into the cell of a closed room", () => {
        const { player, steps, controller } = setup("closed");
        player.x = 100;
        controller.update();
        controller.update();
        expect(steps).toEqual(["r"]);
        player.x = 50;
        controller.update();
        player.x = 100;
        controller.update();
        expect(steps).toEqual(["r", "r"]);
    });

    it("ignores doors of rooms that are not closed", () => {
        const { player, steps, controller } = setup("open");
        player.x = 100;
        controller.update();
        controller.setStates(new Map([["r", "locked"]]));
        player.x = 50;
        controller.update();
        player.x = 100;
        controller.update();
        expect(steps).toEqual([]);
    });
});

describe("RoomDoorController.isLeavingAllowed", () => {
    it("is true only inside a locked room", () => {
        const { player, controller } = setup("locked");
        expect(controller.isLeavingAllowed()).toBe(false);
        player.x = 150;
        controller.update();
        expect(controller.isLeavingAllowed()).toBe(true);
        controller.setStates(new Map([["r", "open"]]));
        expect(controller.isLeavingAllowed()).toBe(false);
    });
});

describe("RoomDoorController near locked door", () => {
    const setupNear = (entitled = false) => {
        const near: (string | null)[] = [];
        const player = { x: 0, y: 150 };
        const controller = new RoomDoorController(player, {
            onPresent: () => {},
            onCrossed: () => {},
            onStepOnDoor: () => {},
            onNearLockedDoor: (key) => near.push(key),
        });
        controller.setRooms([room]);
        controller.setDoors([door]);
        controller.setStates(new Map([["r", "locked"]]));
        if (entitled) {
            controller.setEntitlements({
                all: false,
                roomKeys: new Set(["r"]),
            });
        }
        controller.update();
        return { player, near, controller };
    };

    it("emits once when it comes near and null when it leaves", () => {
        const { player, near, controller } = setupNear();
        expect(near).toEqual([]);
        player.x = 70;
        controller.update();
        controller.update();
        expect(near).toEqual(["r"]);
        player.x = 0;
        controller.update();
        expect(near).toEqual(["r", null]);
    });

    it("emits null when the room unlocks while near", () => {
        const { player, near, controller } = setupNear();
        player.x = 70;
        controller.update();
        controller.setStates(new Map([["r", "open"]]));
        controller.update();
        expect(near).toEqual(["r", null]);
    });

    it("emits null when it becomes entitled while near", () => {
        const { player, near, controller } = setupNear();
        player.x = 70;
        controller.update();
        controller.setEntitlements({ all: true, roomKeys: new Set() });
        controller.update();
        expect(near).toEqual(["r", null]);
    });

    it("never emits for an entitled avatar", () => {
        const { player, near, controller } = setupNear(true);
        player.x = 70;
        controller.update();
        expect(near).toEqual([]);
    });

    it("reports crossing in after an admission teleport", () => {
        const player = { x: 0, y: 150 };
        const crossings: string[] = [];
        const c = new RoomDoorController(player, {
            onPresent: () => {},
            onCrossed: (key, direction) =>
                crossings.push(`${key}:${direction}`),
            onStepOnDoor: () => {},
        });
        c.setRooms([room]);
        c.update();
        player.x = 150;
        c.update();
        expect(crossings).toEqual(["r:in"]);
    });
});
