import { describe, expect, it } from "vitest";
import {
    getAssetTypePreset,
    getPresetLocks,
    getVisibleTypeFields,
    NO_LOCKS,
    snapshotPresetFields,
} from "../getAssetTypePreset";
import { createValues } from "./fixtures";

describe("getAssetTypePreset", () => {
    it("sets a door on the ground, not solid, without action and animated", () => {
        const preset = getAssetTypePreset("DOOR");
        expect(preset?.values).toEqual({
            placement: "GROUND",
            solid: false,
            action: "NONE",
            isAnimated: true,
            frameCount: 4,
            frameDurationMs: 80,
            loopForever: false,
            repeatCount: 0,
        });
        expect(preset?.locked).toEqual({
            placement: true,
            solid: true,
            action: true,
            isAnimated: true,
        });
    });

    it("has no preset and no locks for the other types", () => {
        expect(getAssetTypePreset("CHAIR")).toBeNull();
        expect(getPresetLocks("CHAIR")).toEqual(NO_LOCKS);
        expect(getPresetLocks("DOOR").solid).toBe(true);
    });

    it("keeps what the form held in the fields the preset sets", () => {
        const preset = getAssetTypePreset("DOOR")!;
        const snapshot = snapshotPresetFields(
            createValues({ placement: "SURFACE", solid: true, repeatCount: 7 }),
            preset
        );
        expect(snapshot.placement).toBe("SURFACE");
        expect(snapshot.solid).toBe(true);
        expect(snapshot.repeatCount).toBe(7);
        expect(Object.keys(snapshot).sort()).toEqual(
            Object.keys(preset.values).sort()
        );
    });

    it("hides the fields a door forces and shows all for the other types", () => {
        expect(getVisibleTypeFields("DOOR")).toEqual({
            placement: false,
            action: false,
            solid: false,
            animatedSwitch: false,
            presetNote: true,
            behaviorRow: false,
        });
        expect(getVisibleTypeFields("CHAIR")).toEqual({
            placement: true,
            action: true,
            solid: true,
            animatedSwitch: true,
            presetNote: false,
            behaviorRow: true,
        });
    });
});
