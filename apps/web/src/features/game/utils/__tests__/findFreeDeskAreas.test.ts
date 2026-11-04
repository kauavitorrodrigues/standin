import { describe, expect, it } from "vitest";
import type { HoverTarget } from "@/features/game/types/hover";
import { findFreeDeskAreas } from "../findFreeDeskAreas";

const area = (id: string): HoverTarget => ({
    id,
    bounds: { x: 0, y: 0, width: 32, height: 32 },
});

describe("findFreeDeskAreas", () => {
    it("leaves out the desks somebody holds", () => {
        const free = findFreeDeskAreas(
            [area("a"), area("b"), area("c")],
            [{ mapAssetId: "b" }]
        );
        expect(free.map((desk) => desk.id)).toEqual(["a", "c"]);
    });

    it("returns every desk when nobody holds one", () => {
        expect(findFreeDeskAreas([area("a"), area("b")], [])).toHaveLength(2);
    });

    it("returns nothing when every desk is held", () => {
        expect(findFreeDeskAreas([area("a")], [{ mapAssetId: "a" }])).toEqual(
            []
        );
    });
});
