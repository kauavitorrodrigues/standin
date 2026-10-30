import { describe, expect, it } from "vitest";
import { buildClipUpdate } from "../buildClipUpdate";

const CLIP = { name: "Airhorn", icon: "🎺", volume: 0.8 };

describe("buildClipUpdate", () => {
    it("returns null when nothing changed", () => {
        expect(buildClipUpdate(CLIP, { ...CLIP })).toBeNull();
    });

    it("sends only the field that changed", () => {
        expect(buildClipUpdate(CLIP, { ...CLIP, volume: 0.3 })).toEqual({
            volume: 0.3,
        });
        expect(buildClipUpdate(CLIP, { ...CLIP, name: "Horn" })).toEqual({
            name: "Horn",
        });
    });

    it("trims the name before comparing", () => {
        expect(
            buildClipUpdate(CLIP, { ...CLIP, name: "  Airhorn " })
        ).toBeNull();
    });

    it("clears the icon with null", () => {
        expect(buildClipUpdate(CLIP, { ...CLIP, icon: null })).toEqual({
            icon: null,
        });
    });

    it("sets an icon on a clip that had none", () => {
        expect(
            buildClipUpdate({ ...CLIP, icon: null }, { ...CLIP, icon: "🔔" })
        ).toEqual({ icon: "🔔" });
    });

    it("clamps the volume it sends", () => {
        expect(buildClipUpdate(CLIP, { ...CLIP, volume: 5 })).toEqual({
            volume: 1,
        });
    });
});
