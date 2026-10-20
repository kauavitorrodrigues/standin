import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS, AvatarPartInvalidError } from "@standin/contracts";
import { validateAvatarConfig } from "../validateAvatarConfig";
import type { AvatarConfigPartRow } from "../validateAvatarConfig";

const part = (
    overrides: Partial<AvatarConfigPartRow> = {}
): AvatarConfigPartRow => ({
    id: "hair-1",
    slot: AVATAR_SLOTS.HAIR,
    fileId: "file-front",
    deletedAt: null,
    ...overrides,
});

const none = new Set<string>();

describe("validateAvatarConfig", () => {
    it("returns the choices with the files of the sheets", () => {
        const chosen = validateAvatarConfig(
            { parts: [{ slot: "HAIR", partId: "hair-1" }] },
            [part()],
            none
        );

        expect(chosen).toEqual([
            {
                slot: "HAIR",
                partId: "hair-1",
                fileId: "file-front",
            },
        ]);
    });

    it("accepts the id of a color variation like any other part", () => {
        const [chosen] = validateAvatarConfig(
            { parts: [{ slot: "HAIR", partId: "hair-1-red" }] },
            [part({ id: "hair-1-red" })],
            none
        );

        expect(chosen.partId).toBe("hair-1-red");
    });

    it("refuses a part that does not exist", () => {
        expect(() =>
            validateAvatarConfig(
                { parts: [{ slot: "HAIR", partId: "ghost" }] },
                [],
                none
            )
        ).toThrow(AvatarPartInvalidError);
    });

    it("refuses a part of another slot", () => {
        expect(() =>
            validateAvatarConfig(
                { parts: [{ slot: "HAT", partId: "hair-1" }] },
                [part()],
                none
            )
        ).toThrow(AvatarPartInvalidError);
    });

    it("refuses two entries for the same slot", () => {
        expect(() =>
            validateAvatarConfig(
                {
                    parts: [
                        { slot: "HAIR", partId: "hair-1" },
                        { slot: "HAIR", partId: "hair-1" },
                    ],
                },
                [part()],
                none
            )
        ).toThrow(AvatarPartInvalidError);
    });

    it("refuses a deleted part the person does not have", () => {
        expect(() =>
            validateAvatarConfig(
                { parts: [{ slot: "HAIR", partId: "hair-1" }] },
                [part({ deletedAt: new Date() })],
                none
            )
        ).toThrow(AvatarPartInvalidError);
    });

    it("keeps a deleted part valid for whoever already has it", () => {
        const chosen = validateAvatarConfig(
            { parts: [{ slot: "HAIR", partId: "hair-1" }] },
            [part({ deletedAt: new Date() })],
            new Set(["hair-1"])
        );

        expect(chosen).toHaveLength(1);
    });
});
