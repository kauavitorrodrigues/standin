import { describe, expect, it } from "vitest";
import type { Cell } from "@standin/contracts";
import { getEraseCells } from "@/features/editor/utils/getEraseCells";

describe("getEraseCells", () => {
    it("keeps the path of the drag without Shift", () => {
        const stroke: Cell[] = [
            [1, 1],
            [2, 1],
        ];

        expect(
            getEraseCells({
                shift: false,
                start: [1, 1],
                end: [3, 3],
                stroke,
            })
        ).toEqual(stroke);
    });

    it("takes the whole rectangle between the corners with Shift", () => {
        const cells = getEraseCells({
            shift: true,
            start: [3, 2],
            end: [1, 1],
            stroke: [[3, 2]],
        });

        expect(cells).toEqual([
            [1, 1],
            [2, 1],
            [3, 1],
            [1, 2],
            [2, 2],
            [3, 2],
        ]);
    });
});
