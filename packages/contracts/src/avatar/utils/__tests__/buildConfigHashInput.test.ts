import { describe, expect, it } from "vitest";
import { AVATAR_GRID_VERSION } from "../../consts/dimensions";
import type { AvatarHashBase, AvatarHashPart } from "../../types/layer";
import { buildConfigHashInput, canonicalJson } from "../buildConfigHashInput";

const part = (
    slot: AvatarHashPart["slot"],
    overrides: Partial<AvatarHashPart> = {}
): AvatarHashPart => ({
    slot,
    partId: `part-${slot}`,
    fileId: `file-${slot}`,
    ...overrides,
});

const base: AvatarHashBase = { baseId: "base-1", fileId: "file-base-1" };

describe("canonicalJson", () => {
    it("sorts the keys at every level", () => {
        expect(
            canonicalJson({ b: 1, a: { d: [{ y: 1, x: 2 }], c: null } })
        ).toBe('{"a":{"c":null,"d":[{"x":2,"y":1}]},"b":1}');
    });
});

describe("buildConfigHashInput", () => {
    it("does not depend on the order of the input", () => {
        const a = buildConfigHashInput([part("HAT"), part("SKIN")], base);
        const b = buildConfigHashInput([part("SKIN"), part("HAT")], base);
        expect(a).toBe(b);
    });

    it("includes the grid version, the base and the effective layers in drawing order", () => {
        const parsed = JSON.parse(
            buildConfigHashInput([part("HAT"), part("SKIN")], base)
        );
        expect(parsed.gridVersion).toBe(AVATAR_GRID_VERSION);
        expect(parsed.base).toEqual(base);
        expect(
            parsed.layers.map((layer: { slot: string }) => layer.slot)
        ).toEqual(["SKIN", "HAT"]);
    });

    it("keeps only the costume and no base when there is a costume", () => {
        const parsed = JSON.parse(
            buildConfigHashInput([part("SKIN"), part("COSTUME")], base)
        );
        expect(parsed.base).toBeNull();
        expect(parsed.layers).toHaveLength(1);
        expect(parsed.layers[0].slot).toBe("COSTUME");
    });

    it("changes with the file, the part, the base and the grid", () => {
        const reference = buildConfigHashInput([part("HAIR")], base);
        expect(
            buildConfigHashInput([part("HAIR", { fileId: "other" })], base)
        ).not.toBe(reference);
        expect(
            buildConfigHashInput([part("HAIR", { partId: "red" })], base)
        ).not.toBe(reference);
        expect(
            buildConfigHashInput([part("HAIR")], {
                ...base,
                fileId: "file-base-2",
            })
        ).not.toBe(reference);
        expect(buildConfigHashInput([part("HAIR")], null)).not.toBe(reference);
        expect(
            buildConfigHashInput([part("HAIR")], base, AVATAR_GRID_VERSION + 1)
        ).not.toBe(reference);
    });

    it("does not change with a hidden part under a costume", () => {
        const withHair = buildConfigHashInput(
            [part("HAIR"), part("COSTUME")],
            base
        );
        const without = buildConfigHashInput([part("COSTUME")], null);
        expect(withHair).toBe(without);
    });
});
