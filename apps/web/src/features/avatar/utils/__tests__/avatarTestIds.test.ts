import { describe, expect, it } from "vitest";
import { AVATAR_TEST_IDS } from "../avatarTestIds";

describe("AVATAR_TEST_IDS", () => {
    it("builds a readable id from the slot and the name", () => {
        expect(AVATAR_TEST_IDS.part("hair", "Cabelo Longo")).toBe("avatar-part-hair-cabelo-longo");
        expect(AVATAR_TEST_IDS.part("top", "  Camisa (Azul)! ")).toBe("avatar-part-top-camisa-azul");
        expect(AVATAR_TEST_IDS.color("hair", "Preto Fosco")).toBe("avatar-color-hair-preto-fosco");
    });

    it("drops accents", () => {
        expect(AVATAR_TEST_IDS.part("hair", "Maçã Verde")).toBe("avatar-part-hair-maca-verde");
    });
});
