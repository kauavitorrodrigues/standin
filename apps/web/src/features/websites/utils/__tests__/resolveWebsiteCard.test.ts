import { describe, expect, it } from "vitest";
import { EMBEDDED_WEBSITE_MODES } from "@standin/contracts";
import { resolveWebsiteCard } from "../resolveWebsiteCard";

const ORIGINS = ["https://app.example.com"];

describe("resolveWebsiteCard", () => {
    it("gives the address typed for the object", () => {
        const card = resolveWebsiteCard(
            [
                {
                    id: "a",
                    behaviorParams: {
                        mode: EMBEDDED_WEBSITE_MODES.URL,
                        url: "https://example.com/board",
                    },
                },
            ],
            "a",
            ORIGINS
        );
        expect(card).toEqual({
            kind: "available",
            url: "https://example.com/board",
            host: "example.com",
        });
    });

    it("adds the suffix of the object in prefix mode", () => {
        const card = resolveWebsiteCard(
            [
                {
                    id: "object-1",
                    behaviorParams: {
                        mode: EMBEDDED_WEBSITE_MODES.DERIVED,
                        prefix: "https://example.com/room/",
                    },
                },
            ],
            "object-1",
            ORIGINS
        );
        expect(card?.kind).toBe("available");
        expect(card?.kind === "available" && card.url).toMatch(
            /^https:\/\/example\.com\/room\/.+/
        );
    });

    it("has no button for an address that is no longer valid", () => {
        const card = resolveWebsiteCard(
            [
                {
                    id: "a",
                    behaviorParams: {
                        mode: EMBEDDED_WEBSITE_MODES.URL,
                        url: "http://example.com",
                    },
                },
            ],
            "a",
            ORIGINS
        );
        expect(card).toEqual({ kind: "unavailable" });
    });

    it("has no button for the address of the app itself", () => {
        const card = resolveWebsiteCard(
            [
                {
                    id: "a",
                    behaviorParams: {
                        mode: EMBEDDED_WEBSITE_MODES.URL,
                        url: "https://app.example.com/space",
                    },
                },
            ],
            "a",
            ORIGINS
        );
        expect(card).toEqual({ kind: "unavailable" });
    });

    it("has no card for an object without params", () => {
        expect(
            resolveWebsiteCard(
                [{ id: "a", behaviorParams: null }],
                "a",
                ORIGINS
            )
        ).toBeNull();
    });

    it("has no card for an unknown object", () => {
        expect(resolveWebsiteCard([], "a", ORIGINS)).toBeNull();
    });
});
