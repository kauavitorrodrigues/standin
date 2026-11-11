import { describe, expect, it } from "vitest";
import { parsePageMetadata } from "../parsePageMetadata";

describe("parsePageMetadata", () => {
    it("reads the title", () => {
        const { title } = parsePageMetadata(
            "<html><head><title>Whiteboard</title></head></html>"
        );
        expect(title).toBe("Whiteboard");
    });

    it("decodes entities and collapses whitespace", () => {
        const { title } = parsePageMetadata(
            "<title>\n  Tom &amp; Jerry &#8211; &#x41;\n  &quot;live&quot; </title>"
        );
        expect(title).toBe('Tom & Jerry – A "live"');
    });

    it("keeps the text of an entity it does not know", () => {
        const { title } = parsePageMetadata("<title>a &nope; b</title>");
        expect(title).toBe("a &nope; b");
    });

    it("keeps a code point past Unicode as typed", () => {
        const { title } = parsePageMetadata("<title>a &#99999999; b</title>");
        expect(title).toBe("a &#99999999; b");
    });

    it("never gives markup as the title", () => {
        const { title } = parsePageMetadata(
            "<title>&lt;script&gt;alert(1)&lt;/script&gt;</title>"
        );
        // Plain text for the page to show, which React escapes.
        expect(title).toBe("<script>alert(1)</script>");
    });

    it("cuts a long title", () => {
        const { title } = parsePageMetadata(
            `<title>${"a".repeat(500)}</title>`
        );
        expect(title).toHaveLength(120);
    });

    it("drops control characters", () => {
        const { title } = parsePageMetadata("<title>a\u0000b\u0007c</title>");
        expect(title).toBe("a b c");
    });

    it("falls back to og:title when there is no title", () => {
        const { title } = parsePageMetadata(
            '<meta property="og:title" content="From the card">'
        );
        expect(title).toBe("From the card");
    });

    it("prefers the title tag over og:title", () => {
        const { title } = parsePageMetadata(
            '<meta property="og:title" content="Other"><title>Tag</title>'
        );
        expect(title).toBe("Tag");
    });

    it("has no title for an empty one", () => {
        expect(parsePageMetadata("<title>   </title>").title).toBeNull();
        expect(parsePageMetadata("<p>nothing</p>").title).toBeNull();
    });

    it("reads the icons in the order to try", () => {
        const { iconHrefs } = parsePageMetadata(
            `<link rel="apple-touch-icon" href="/touch.png">
             <link rel="shortcut icon" href="/favicon.png">
             <link href='/other.png' rel='icon'>`
        );
        expect(iconHrefs).toEqual(["/favicon.png", "/other.png", "/touch.png"]);
    });

    it("leaves svg icons out", () => {
        const { iconHrefs } = parsePageMetadata(
            `<link rel="icon" type="image/svg+xml" href="/a">
             <link rel="icon" href="/b.svg?v=2">
             <link rel="icon" href="/c.png">`
        );
        expect(iconHrefs).toEqual(["/c.png"]);
    });

    it("ignores links that are not icons", () => {
        const { iconHrefs } = parsePageMetadata(
            '<link rel="stylesheet" href="/a.css"><link rel="icon">'
        );
        expect(iconHrefs).toEqual([]);
    });
});
