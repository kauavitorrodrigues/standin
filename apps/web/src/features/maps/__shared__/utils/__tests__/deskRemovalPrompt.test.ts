import { describe, expect, it } from "vitest";
import type { UserSummary } from "@standin/contracts";
import { getDeskRemovalPrompt } from "@/features/maps/__shared__/utils/getDeskRemovalPrompt";
import { joinNames } from "@/features/maps/__shared__/utils/joinNames";

const members: UserSummary[] = [
    { id: "u1", name: "Ana", profilePictureUrl: null },
    { id: "u2", name: "Bia", profilePictureUrl: null },
];

describe("getDeskRemovalPrompt", () => {
    it("names the owner of the desk", () => {
        const prompt = getDeskRemovalPrompt({
            pending: ["d1"],
            desks: [{ mapAssetId: "d1", userId: "u1" }],
            members,
        });

        expect(prompt).toEqual({ owners: "Ana", plural: false });
    });

    it("joins the owners of several desks", () => {
        const prompt = getDeskRemovalPrompt({
            pending: ["d1", "d2"],
            desks: [
                { mapAssetId: "d1", userId: "u1" },
                { mapAssetId: "d2", userId: "u2" },
            ],
            members,
        });

        expect(prompt).toEqual({ owners: "Ana e Bia", plural: true });
    });

    it("falls back when the owner is not among the members", () => {
        const prompt = getDeskRemovalPrompt({
            pending: ["d1"],
            desks: [{ mapAssetId: "d1", userId: "ghost" }],
            members: [],
        });

        expect(prompt?.owners).toBe("outra pessoa");
    });

    it("does not ask when nothing is pending or nobody owns the desk", () => {
        expect(
            getDeskRemovalPrompt({ pending: [], desks: [], members })
        ).toBeNull();
        expect(
            getDeskRemovalPrompt({ pending: ["d1"], desks: [], members })
        ).toBeNull();
    });
});

describe("joinNames", () => {
    it("joins with commas and a final e", () => {
        expect(joinNames([])).toBe("");
        expect(joinNames(["Ana"])).toBe("Ana");
        expect(joinNames(["Ana", "Bia"])).toBe("Ana e Bia");
        expect(joinNames(["Ana", "Bia", "Caio"])).toBe("Ana, Bia e Caio");
    });
});
