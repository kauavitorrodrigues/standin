import { describe, expect, it } from "vitest";
import { describeWaveToast } from "../describeWaveToast";

describe("describeWaveToast", () => {
    it("names the person who waved and shows their avatar", () => {
        const toast = describeWaveToast("u1", {
            name: "Ana",
            profilePictureUrl: "https://x/a.png",
        });

        expect(toast.title).toBe("Ana");
        expect(toast.description).toBe("acenou para você 👋");
        expect(toast.data.avatar).toEqual({
            id: "u1",
            name: "Ana",
            src: "https://x/a.png",
        });
    });

    it("still makes a toast for a person who is not known", () => {
        const toast = describeWaveToast("u1", undefined);

        expect(toast.title).toBe("Alguém");
        expect(toast.data.avatar.src).toBeNull();
    });
});
