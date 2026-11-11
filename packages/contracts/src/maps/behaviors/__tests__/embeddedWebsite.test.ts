import { describe, expect, it } from "vitest";
import {
    EMBEDDED_WEBSITE_FALLBACK_URL,
    EMBEDDED_WEBSITE_SUFFIX_LENGTH,
    EMBEDDED_WEBSITE_URL_MAX,
} from "../consts";
import { AssetBehaviorSchema, EmbeddedWebsiteParamsSchema } from "../schemas";
import { deriveSuffix } from "../utils/deriveSuffix";
import { parseBehaviorParams } from "../utils/parseBehaviorParams";
import { parseEmbeddedWebsiteUrl } from "../utils/parseEmbeddedWebsiteUrl";
import { resolveEmbeddedUrl } from "../utils/resolveEmbeddedUrl";
import { validateBehaviorParams } from "../utils/validateBehaviorParams";

const appOrigins = ["https://standin.example"];

describe("AssetBehaviorSchema", () => {
    it("accepts none and the embedded website", () => {
        expect(AssetBehaviorSchema.safeParse("NONE").success).toBe(true);
        expect(AssetBehaviorSchema.safeParse("EMBEDDED_WEBSITE").success).toBe(
            true
        );
    });

    it("refuses the reserved behaviors", () => {
        for (const kind of ["GONG", "GITHUB_TRACKER", "WEBHOOK", "other"]) {
            expect(AssetBehaviorSchema.safeParse(kind).success).toBe(false);
        }
    });
});

describe("EmbeddedWebsiteParamsSchema", () => {
    it("accepts both modes", () => {
        expect(
            EmbeddedWebsiteParamsSchema.safeParse({
                mode: "url",
                url: "https://example.com",
            }).success
        ).toBe(true);
        expect(
            EmbeddedWebsiteParamsSchema.safeParse({
                mode: "derived",
                prefix: "https://meet.example/room-",
            }).success
        ).toBe(true);
    });

    it("drops the fields of the other mode", () => {
        expect(
            EmbeddedWebsiteParamsSchema.parse({
                mode: "url",
                url: "https://example.com",
                prefix: "https://left-over.example",
            })
        ).toEqual({ mode: "url", url: "https://example.com" });
    });

    it("refuses params without a mode or with an empty address", () => {
        expect(EmbeddedWebsiteParamsSchema.safeParse({}).success).toBe(false);
        expect(
            EmbeddedWebsiteParamsSchema.safeParse({ mode: "url", url: "  " })
                .success
        ).toBe(false);
    });
});

describe("parseEmbeddedWebsiteUrl", () => {
    it("accepts an https address", () => {
        expect(parseEmbeddedWebsiteUrl("https://example.com/a?b=1")).toEqual({
            ok: true,
            url: "https://example.com/a?b=1",
        });
    });

    it.each([
        "http://example.com",
        "javascript:alert(1)",
        "JavaScript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "ftp://example.com",
        "not a url",
        "",
        "   ",
        "https://user:secret@example.com",
    ])("refuses %s", (value) => {
        expect(parseEmbeddedWebsiteUrl(value)).toEqual({
            ok: false,
            reason: "invalid",
        });
    });

    it("refuses more than 2048 characters", () => {
        const long = `https://example.com/${"a".repeat(EMBEDDED_WEBSITE_URL_MAX)}`;
        expect(parseEmbeddedWebsiteUrl(long).ok).toBe(false);
    });

    it("refuses the origin of the app", () => {
        expect(
            parseEmbeddedWebsiteUrl("https://standin.example/space/1", {
                appOrigins,
            })
        ).toEqual({ ok: false, reason: "own_origin" });
    });

    it("rewrites known providers to their embeddable form", () => {
        const cases: [string, string][] = [
            [
                "https://www.youtube.com/watch?v=abc123",
                "https://www.youtube.com/embed/abc123",
            ],
            ["https://youtu.be/abc123", "https://www.youtube.com/embed/abc123"],
            ["https://vimeo.com/12345", "https://player.vimeo.com/video/12345"],
            [
                "https://www.loom.com/share/abc123def",
                "https://www.loom.com/embed/abc123def",
            ],
            [
                "https://docs.google.com/document/d/DOC_ID/edit?usp=sharing",
                "https://docs.google.com/document/d/DOC_ID/preview",
            ],
            [
                "https://docs.google.com/presentation/d/DECK_ID/edit",
                "https://docs.google.com/presentation/d/DECK_ID/embed",
            ],
        ];
        for (const [input, output] of cases) {
            expect(parseEmbeddedWebsiteUrl(input)).toEqual({
                ok: true,
                url: output,
            });
        }
    });
});

describe("deriveSuffix", () => {
    it("is the same for the same object and short", () => {
        expect(deriveSuffix("object-1")).toBe(deriveSuffix("object-1"));
        expect(deriveSuffix("object-1")).toHaveLength(
            EMBEDDED_WEBSITE_SUFFIX_LENGTH
        );
    });

    it("differs between objects", () => {
        expect(deriveSuffix("object-1")).not.toBe(deriveSuffix("object-2"));
    });
});

describe("resolveEmbeddedUrl", () => {
    it("gives the address in url mode", () => {
        expect(
            resolveEmbeddedUrl("o1", {
                mode: "url",
                url: "https://example.com",
            })
        ).toBe("https://example.com/");
    });

    it("joins the prefix and the suffix of the object in derived mode", () => {
        expect(
            resolveEmbeddedUrl("o1", {
                mode: "derived",
                prefix: "https://meet.example/room-",
            })
        ).toBe(`https://meet.example/room-${deriveSuffix("o1")}`);
    });

    it("gives the fixed fallback for a stored value that is invalid", () => {
        expect(
            resolveEmbeddedUrl("o1", {
                mode: "url",
                url: "javascript:alert(1)",
            })
        ).toBe(EMBEDDED_WEBSITE_FALLBACK_URL);
        expect(
            resolveEmbeddedUrl(
                "o1",
                { mode: "url", url: "https://standin.example/" },
                { appOrigins }
            )
        ).toBe(EMBEDDED_WEBSITE_FALLBACK_URL);
    });
});

describe("validateBehaviorParams", () => {
    it("checks the final address of a derived website", () => {
        expect(
            validateBehaviorParams({
                mode: "derived",
                prefix: "http://meet.example/room-",
            }).ok
        ).toBe(false);
        expect(
            validateBehaviorParams({
                mode: "derived",
                prefix: "https://meet.example/room-",
            }).ok
        ).toBe(true);
    });
});

describe("validateBehaviorParams, derived prefix", () => {
    it("refuses a prefix that stops inside the host", () => {
        expect(
            validateBehaviorParams({
                mode: "derived",
                prefix: "https://meet.example.co",
            }).ok
        ).toBe(false);
    });

    it("accepts a prefix that ends in the path, the query or the fragment", () => {
        for (const prefix of [
            "https://meet.example/room-",
            "https://meet.example/?room=",
            "https://meet.example/#",
        ]) {
            expect(validateBehaviorParams({ mode: "derived", prefix }).ok).toBe(
                true
            );
        }
    });
});

describe("parseBehaviorParams", () => {
    it("reads valid params and gives null for anything else", () => {
        expect(
            parseBehaviorParams({ mode: "url", url: "https://example.com" })
        ).toEqual({ mode: "url", url: "https://example.com" });
        expect(parseBehaviorParams(null)).toBeNull();
        expect(parseBehaviorParams({ mode: "other" })).toBeNull();
    });
});
