import { describe, expect, it } from "vitest";
import { SIZE_TIERS, validateEditorOps } from "@standin/contracts";
import type { BuildStep } from "../types";
import { composeOps } from "../compose/composeOps";
import { createRoom } from "../builders/createRoom";
import { placeDesk } from "../builders/placeDesk";
import { placeDoor } from "../builders/placeDoor";
import { placeObject } from "../builders/placeObject";
import { setSpawn } from "../builders/setSpawn";
import { ROOM, buildModel } from "./kit";

const steps: BuildStep[] = [
    (model) => createRoom(model, ROOM),
    (model) =>
        placeDoor(model, { room: "office", side: "south", door: "door-s" }),
    (model) =>
        placeDesk(model, {
            desk: "desk",
            tileX: 6,
            tileY: 7,
            items: [{ asset: "monitor", tileX: 6, tileY: 7 }],
            chairs: [{ asset: "chair", tileX: 6, tileY: 8 }],
        }),
    (model) => placeObject(model, { asset: "crate", tileX: 11, tileY: 6 }),
    (model) => setSpawn(model, { tileX: 8, tileY: 9 }),
];

describe("composeOps", () => {
    it("builds room, door, desk, object and spawn that validate cleanly", () => {
        const model = buildModel();

        const result = composeOps(model, steps, { requireSpawn: true });

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(validateEditorOps(model, result.ops).ok).toBe(true);
        expect(result.model.placed.map(({ assetId }) => assetId)).toEqual([
            "door-s",
            "desk",
            "monitor",
            "chair",
            "crate",
        ]);
        const zones = result.model.layout.layers.find(
            ({ name }) => name === "zones"
        ) as { objects: { properties: { name: string; value: unknown }[] }[] };
        const kinds = zones.objects.map(
            ({ properties }) =>
                properties.find(({ name }) => name === "kind")?.value
        );
        expect(kinds).toEqual(["private", "spawn"]);
    });

    it("lets a step see what the earlier ones placed", () => {
        const result = composeOps(buildModel(), [
            (model) =>
                placeObject(model, { asset: "crate", tileX: 3, tileY: 3 }),
            (model) =>
                placeObject(model, { asset: "crate", tileX: 4, tileY: 3 }),
        ]);

        expect(result.ok && result.ops.map((op) => (op as any).tempId)).toEqual(
            ["authoring-1", "authoring-2"]
        );
    });

    it("is deterministic", () => {
        expect(composeOps(buildModel(), steps)).toEqual(
            composeOps(buildModel(), steps)
        );
    });

    it("names the step that failed, with the op index of the whole list", () => {
        const result = composeOps(buildModel(), [
            ...steps.slice(0, 2),
            (model) =>
                placeObject(model, { asset: "crate", tileX: 8, tileY: 11 }),
        ]);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.stepIndex).toBe(2);
        // The room (3 ops) and the door (2 ops) come first, so this is op 5.
        expect(result.issues[0]).toMatchObject({
            code: "FOOTPRINT_OVERLAP",
            opIndex: 5,
        });
    });

    it("stops at the first failing step", () => {
        let reached = false;
        const result = composeOps(buildModel(), [
            (model) =>
                placeObject(model, { asset: "nope", tileX: 1, tileY: 1 }),
            (model) => {
                reached = true;
                return setSpawn(model, { tileX: 1, tileY: 1 });
            },
        ]);

        expect(result.ok).toBe(false);
        expect(reached).toBe(false);
        expect(!result.ok && result.stepIndex).toBe(0);
    });

    it("refuses a door left outside every room, pointing at the last step", () => {
        const model = buildModel();
        const outside = composeOps(model, [
            (m) => placeObject(m, { asset: "door-n", tileX: 20, tileY: 15 }),
            (m) => placeObject(m, { asset: "crate", tileX: 1, tileY: 1 }),
        ]);

        expect(outside.ok).toBe(false);
        if (outside.ok) return;
        expect(outside.stepIndex).toBe(1);
        expect(outside.issues[0]).toMatchObject({
            code: "DOOR_OUTSIDE_PRIVATE_ZONE",
            opIndex: 1,
        });
    });

    it("asks for a spawn only when told to", () => {
        const room = [steps[0] as BuildStep];

        expect(composeOps(buildModel(), room).ok).toBe(true);
        const strict = composeOps(buildModel(), room, { requireSpawn: true });
        expect(!strict.ok && strict.issues[0]).toMatchObject({
            code: "SPAWN_MISSING",
        });
    });

    it("keeps a room inside the size of its tier", () => {
        const { maxWidth, maxHeight } = SIZE_TIERS.XS;
        const model = buildModel(maxWidth, maxHeight);

        const fits = composeOps(model, [
            (m) =>
                createRoom(m, {
                    ...ROOM,
                    x: 0,
                    y: 0,
                    width: maxWidth,
                    height: maxHeight,
                }),
        ]);
        const past = composeOps(model, [
            (m) =>
                createRoom(m, {
                    ...ROOM,
                    x: 1,
                    y: 0,
                    width: maxWidth,
                    height: maxHeight,
                }),
        ]);

        expect(fits.ok).toBe(true);
        expect(past.ok).toBe(false);
    });
});
