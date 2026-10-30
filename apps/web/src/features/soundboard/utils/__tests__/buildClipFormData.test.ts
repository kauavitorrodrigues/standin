import { describe, expect, it } from "vitest";
import { buildClipFormData } from "../buildClipFormData";

const BYTES = new Uint8Array([1, 2, 3]);

describe("buildClipFormData", () => {
    it("sends the file, the name and the volume as a decimal string", () => {
        const body = buildClipFormData(BYTES, {
            name: "Airhorn",
            icon: null,
            volume: 0.6,
        });

        expect(body.get("name")).toBe("Airhorn");
        expect(body.get("volume")).toBe("0.6");
        expect(body.get("file")).toBeInstanceOf(Blob);
    });

    it("leaves the icon out when the clip has none", () => {
        const body = buildClipFormData(BYTES, {
            name: "a",
            icon: null,
            volume: 1,
        });

        expect(body.has("icon")).toBe(false);
    });

    it("leaves the icon out for an empty string", () => {
        const body = buildClipFormData(BYTES, {
            name: "a",
            icon: "",
            volume: 1,
        });

        expect(body.has("icon")).toBe(false);
    });

    it("sends the icon when there is one", () => {
        const body = buildClipFormData(BYTES, {
            name: "a",
            icon: "🎺",
            volume: 1,
        });

        expect(body.get("icon")).toBe("🎺");
    });

    it("clamps a volume outside the range", () => {
        const body = buildClipFormData(BYTES, {
            name: "a",
            icon: null,
            volume: 4,
        });

        expect(body.get("volume")).toBe("1");
    });
});
