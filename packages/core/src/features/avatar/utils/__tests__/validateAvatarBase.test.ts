import { describe, expect, it } from "vitest";
import { AvatarBaseInvalidError } from "@standin/contracts";
import { validateAvatarBase } from "../validateAvatarBase";

describe("validateAvatarBase", () => {
    it("accepts an active base", () => {
        const base = { id: "base-1", deletedAt: null, kind: "BODY" as const };

        expect(validateAvatarBase(base, null)).toBe(base);
    });

    it("refuses a base that does not exist", () => {
        expect(() => validateAvatarBase(undefined, null)).toThrow(
            AvatarBaseInvalidError
        );
    });

    it("refuses a deleted base the person does not use", () => {
        expect(() =>
            validateAvatarBase(
                { id: "base-1", deletedAt: new Date(), kind: "BODY" },
                null
            )
        ).toThrow(AvatarBaseInvalidError);
    });

    it("keeps a deleted base valid for whoever already uses it", () => {
        const base = {
            id: "base-1",
            deletedAt: new Date(),
            kind: "BODY" as const,
        };

        expect(validateAvatarBase(base, "base-1")).toBe(base);
    });

    it("refuses a mannequin, even for whoever somehow owns it", () => {
        const mannequin = {
            id: "base-9",
            deletedAt: null,
            kind: "MANNEQUIN" as const,
        };

        expect(() => validateAvatarBase(mannequin, null)).toThrow(
            AvatarBaseInvalidError
        );
        expect(() => validateAvatarBase(mannequin, "base-9")).toThrow(
            AvatarBaseInvalidError
        );
    });
});
