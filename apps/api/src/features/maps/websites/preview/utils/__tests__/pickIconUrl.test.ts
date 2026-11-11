import { describe, expect, it } from "vitest";
import { pickIconUrl } from "../pickIconUrl";

const PAGE = "https://example.com/app/board";

describe("pickIconUrl", () => {
    it("resolves an address against the page", () => {
        expect(pickIconUrl(["icon.png"], PAGE)).toBe(
            "https://example.com/app/icon.png"
        );
        expect(pickIconUrl(["/icon.png"], PAGE)).toBe(
            "https://example.com/icon.png"
        );
        expect(pickIconUrl(["//cdn.example.net/i.png"], PAGE)).toBe(
            "https://cdn.example.net/i.png"
        );
    });

    it("skips what cannot be fetched and takes the next", () => {
        expect(
            pickIconUrl(
                [
                    "http://example.com/a.png",
                    "data:image/png;base64,AAAA",
                    "https://example.com:8443/b.png",
                    "/c.png",
                ],
                PAGE
            )
        ).toBe("https://example.com/c.png");
    });

    it("falls back to the favicon of the site", () => {
        expect(pickIconUrl([], PAGE)).toBe("https://example.com/favicon.ico");
    });

    it("has no icon for a page that is not https", () => {
        expect(pickIconUrl([], "http://example.com/")).toBeNull();
    });
});
