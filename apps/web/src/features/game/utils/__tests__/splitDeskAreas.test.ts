import { describe, expect, it } from "vitest";
import { splitDeskAreas } from "../splitDeskAreas";

const area = (id: string) => ({
    id,
    bounds: { x: 0, y: 0, width: 32, height: 32 },
});

describe("splitDeskAreas", () => {
    const areas = [area("a"), area("b"), area("c")];
    const claims = [
        { mapAssetId: "a", userId: "me" },
        { mapAssetId: "b", userId: "other" },
    ];

    it("separates the desk of the person from the ones of others", () => {
        const { own, others } = splitDeskAreas(areas, claims, "me");

        expect(own?.id).toBe("a");
        expect(others.map(({ id }) => id)).toEqual(["b"]);
    });

    it("leaves free desks in neither", () => {
        const { own, others } = splitDeskAreas(areas, claims, "me");

        expect([own?.id, ...others.map(({ id }) => id)]).not.toContain("c");
    });

    it("has no own desk when the person holds none", () => {
        const { own, others } = splitDeskAreas(areas, claims, "nobody");

        expect(own).toBeNull();
        expect(others.map(({ id }) => id)).toEqual(["a", "b"]);
    });

    it("ignores claims of desks that are not on the map", () => {
        const { own, others } = splitDeskAreas(
            [],
            [{ mapAssetId: "gone", userId: "me" }],
            "me"
        );

        expect(own).toBeNull();
        expect(others).toEqual([]);
    });
});
