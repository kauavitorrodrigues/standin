import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import type { AvatarPart } from "@standin/contracts";
import type { AvatarPartGroup } from "../../types/parts";
import { findPartFamily } from "../admin/findPartFamily";

const family = (id: string): AvatarPart => ({
    id,
    key: id,
    name: id,
    slot: AVATAR_SLOTS.HAT,
    basePartId: null,
    colorKey: null,
    colorHex: null,
    url: `/files/${id}`,
    previewUrl: `/files/${id}-preview`,
    createdAt: "2026-10-16T10:00:00.000Z",
    variations: [],
});

const slots: AvatarPartGroup[] = [
    { slot: AVATAR_SLOTS.SKIN, parts: [family("a")] },
    { slot: AVATAR_SLOTS.HAT, parts: [family("b"), family("c")] },
];

describe("findPartFamily", () => {
    it("finds a family in any slot", () => {
        expect(findPartFamily(slots, "c")?.id).toBe("c");
    });

    it("answers null for an id the list does not have", () => {
        expect(findPartFamily(slots, "z")).toBeNull();
    });
});
