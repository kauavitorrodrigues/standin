import { describe, expect, it } from "vitest";
import { isFrameOnAppOrigin } from "../isFrameOnAppOrigin";

const APP = "https://app.example.com";
const frameAt = (origin: string) =>
    ({
        contentWindow: { location: { origin } },
    }) as unknown as HTMLIFrameElement;

describe("isFrameOnAppOrigin", () => {
    it("is true for a page on the origin of the app", () => {
        expect(isFrameOnAppOrigin(frameAt(APP), APP)).toBe(true);
    });

    it("is false for a page on another origin that can be read", () => {
        expect(isFrameOnAppOrigin(frameAt("https://example.com"), APP)).toBe(
            false
        );
    });

    it("is false when the browser hides the location of the page", () => {
        const frame = {
            get contentWindow(): never {
                throw new DOMException("Blocked", "SecurityError");
            },
        } as unknown as HTMLIFrameElement;
        expect(isFrameOnAppOrigin(frame, APP)).toBe(false);
    });

    it("is false when the location throws on read", () => {
        const frame = {
            contentWindow: {
                get location(): never {
                    throw new DOMException("Blocked", "SecurityError");
                },
            },
        } as unknown as HTMLIFrameElement;
        expect(isFrameOnAppOrigin(frame, APP)).toBe(false);
    });

    it("is false with no window in the frame", () => {
        const frame = { contentWindow: null } as HTMLIFrameElement;
        expect(isFrameOnAppOrigin(frame, APP)).toBe(false);
    });
});
