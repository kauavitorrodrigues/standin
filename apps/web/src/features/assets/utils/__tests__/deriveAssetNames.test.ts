import { describe, expect, it } from "vitest";
import {
    getFileBaseName,
    toDisplayName,
    toKeyPreview,
} from "../deriveAssetNames";

describe("deriveAssetNames", () => {
    it("drops the extension of the file name", () => {
        expect(getFileBaseName("tree_orchard.png")).toBe("tree_orchard");
        expect(getFileBaseName("a.b.png")).toBe("a.b");
    });

    it("makes a readable name", () => {
        expect(toDisplayName("tree_orchard_sapling")).toBe(
            "Tree orchard sapling"
        );
    });
});

describe("toKeyPreview", () => {
    it("makes a lowercase key without accents", () => {
        expect(toKeyPreview("Árvore  do Pomar!")).toBe("arvore-do-pomar");
    });
});
