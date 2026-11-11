import { describe, expect, it } from "vitest";
import type { EmbeddedWebsiteParams } from "../../../behaviors/schemas";
import type { EditorModel } from "../../types/editor-model";
import { assertDiffInScope } from "../assertDiffInScope";

const member = { userId: "u1" };
const editor = { userId: "u2", canEdit: true };
const website: EmbeddedWebsiteParams = {
    mode: "url",
    url: "https://example.com",
};

const model = (
    name: string,
    placed: { id: string; behaviorParams: EmbeddedWebsiteParams | null }[] = []
) =>
    ({
        layout: { layers: [{ name }], width: 4 },
        placed,
    }) as unknown as EditorModel;

describe("assertDiffInScope", () => {
    it("accepts a diff that leaves the layout alone in the objects scope", () => {
        expect(
            assertDiffInScope(
                model("a"),
                model("a"),
                { kind: "objects" },
                member
            )
        ).toEqual([]);
    });

    it("refuses a diff that changes the layout in the objects scope", () => {
        const issues = assertDiffInScope(
            model("a"),
            model("b"),
            { kind: "objects" },
            member
        );

        expect(issues).toHaveLength(1);
        expect(issues[0].code).toBe("OUT_OF_SCOPE");
    });

    it("allows a layout change in the map scope", () => {
        expect(
            assertDiffInScope(model("a"), model("b"), { kind: "map" }, member)
        ).toEqual([]);
    });

    describe("params of a behavior in the objects scope", () => {
        const scope = { kind: "objects" } as const;
        const without = model("a", [{ id: "o1", behaviorParams: null }]);
        const withParams = model("a", [{ id: "o1", behaviorParams: website }]);

        it("refuses params that appear for someone who only decorates", () => {
            expect(
                assertDiffInScope(without, withParams, scope, member)
            ).toMatchObject([{ code: "OUT_OF_SCOPE" }]);
            expect(
                assertDiffInScope(
                    without,
                    model("a", [
                        { id: "o1", behaviorParams: null },
                        { id: "new", behaviorParams: website },
                    ]),
                    scope,
                    member
                )
            ).toMatchObject([{ code: "OUT_OF_SCOPE" }]);
        });

        it("refuses params that change for someone who only decorates", () => {
            const changed = model("a", [
                {
                    id: "o1",
                    behaviorParams: {
                        mode: "url",
                        url: "https://other.example",
                    },
                },
            ]);
            expect(
                assertDiffInScope(withParams, changed, scope, member)
            ).toMatchObject([{ code: "OUT_OF_SCOPE" }]);
        });

        it("allows params to be cleared or left alone", () => {
            expect(
                assertDiffInScope(withParams, without, scope, member)
            ).toEqual([]);
            expect(
                assertDiffInScope(withParams, withParams, scope, member)
            ).toEqual([]);
        });

        it("allows an owner or an editor to set them", () => {
            expect(
                assertDiffInScope(without, withParams, scope, editor)
            ).toEqual([]);
        });
    });
});
