import { describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import { getReleaseDeskIds } from "../getReleaseDeskIds";

describe("getReleaseDeskIds", () => {
    it("keeps only remove_asset ops with releaseDesk on", () => {
        const ops = [
            { type: "remove_asset", id: "a", releaseDesk: true },
            { type: "remove_asset", id: "b", releaseDesk: false },
            { type: "remove_asset", id: "c" },
            { type: "move_asset", id: "d", tileX: 1, tileY: 1 },
        ] as EditorOp[];

        expect(getReleaseDeskIds(ops)).toEqual(["a"]);
    });

    it("does not repeat an id", () => {
        const ops = [
            { type: "remove_asset", id: "a", releaseDesk: true },
            { type: "remove_asset", id: "a", releaseDesk: true },
        ] as EditorOp[];

        expect(getReleaseDeskIds(ops)).toEqual(["a"]);
    });

    it("answers empty without ops", () => {
        expect(getReleaseDeskIds([])).toEqual([]);
    });
});
