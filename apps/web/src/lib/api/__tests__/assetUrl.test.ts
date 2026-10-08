import { describe, expect, it } from "vitest";
import { rebaseAssetUrl } from "../assetUrl";

describe("rebaseAssetUrl", () => {
    it("leaves the url alone when the API is addressed by origin", () => {
        expect(
            rebaseAssetUrl(
                "http://localhost:3001/public/maps/a.json",
                "http://localhost:3001"
            )
        ).toBe("http://localhost:3001/public/maps/a.json");
    });

    it("moves the url onto the proxy prefix", () => {
        expect(
            rebaseAssetUrl("http://localhost:3001/public/maps/a.json", "/api")
        ).toBe("/api/public/maps/a.json");
    });

    it("keeps the query string", () => {
        expect(
            rebaseAssetUrl("http://localhost:3001/public/t.png?v=2", "/api")
        ).toBe("/api/public/t.png?v=2");
    });

    it("leaves files kept in external storage alone", () => {
        expect(
            rebaseAssetUrl("https://cdn.example.com/maps/a.json", "/api")
        ).toBe("https://cdn.example.com/maps/a.json");
    });

    it("leaves something that is not an absolute url alone", () => {
        expect(rebaseAssetUrl("/public/t.png", "/api")).toBe("/public/t.png");
    });
});
