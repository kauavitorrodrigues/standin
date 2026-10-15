import { describe, expect, it } from "vitest";
import { getSizeTierLabel } from "../getSizeTierLabel";
import { getStatusLabel } from "../getStatusLabel";

describe("template labels", () => {
    it("shows the tier with its largest map", () => {
        expect(getSizeTierLabel("XS")).toBe("XS (até 24 x 16 tiles)");
    });

    it("names each status in Portuguese", () => {
        expect(getStatusLabel("DRAFT")).toBe("Rascunho");
        expect(getStatusLabel("PUBLISHED")).toBe("Publicado");
        expect(getStatusLabel("RETIRED")).toBe("Aposentado");
    });
});
