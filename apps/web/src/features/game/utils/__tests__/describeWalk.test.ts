import { describe, expect, it } from "vitest";
import { describeWalk } from "../describeWalk";

const names: Record<string, string> = { ana: "Ana" };
const getName = (id: string) => names[id];

describe("describeWalk", () => {
    it("says the destination of a double click", () => {
        expect(describeWalk({ kind: "tile" }, getName)).toBe(
            "Indo para o destino"
        );
    });

    it("says the desk of the person", () => {
        expect(describeWalk({ kind: "desk" }, getName)).toBe(
            "Indo para a sua mesa"
        );
    });

    it("names the person walked to", () => {
        expect(describeWalk({ kind: "person", userId: "ana" }, getName)).toBe(
            "Indo até Ana"
        );
    });

    it("uses plain wording when the name is not known", () => {
        expect(describeWalk({ kind: "person", userId: "zed" }, getName)).toBe(
            "Indo até a pessoa"
        );
    });
});
