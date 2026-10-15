import { describe, expect, it } from "vitest";
import type { EditorModel } from "../../types/editor-model";
import { assertDiffInScope } from "../assertDiffInScope";

const model = (name: string) =>
    ({ layout: { layers: [{ name }], width: 4 } }) as unknown as EditorModel;

describe("assertDiffInScope", () => {
    it("accepts a diff that leaves the layout alone in the objects scope", () => {
        expect(
            assertDiffInScope(model("a"), model("a"), { kind: "objects" })
        ).toEqual([]);
    });

    it("refuses a diff that changes the layout in the objects scope", () => {
        const issues = assertDiffInScope(model("a"), model("b"), {
            kind: "objects",
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].code).toBe("OUT_OF_SCOPE");
    });

    it("allows a layout change in the map scope", () => {
        expect(
            assertDiffInScope(model("a"), model("b"), { kind: "map" })
        ).toEqual([]);
    });
});
