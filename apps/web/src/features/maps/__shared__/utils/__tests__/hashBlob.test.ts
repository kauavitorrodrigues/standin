import { afterEach, describe, expect, it, vi } from "vitest";
import { hashBlob } from "../hashBlob";

const png = (text: string) => new Blob([text], { type: "image/png" });

describe("hashBlob", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("gives the same fingerprint to the same bytes", async () => {
        expect(await hashBlob(png("same"))).toBe(await hashBlob(png("same")));
    });

    it("gives another fingerprint to other bytes", async () => {
        expect(await hashBlob(png("one"))).not.toBe(await hashBlob(png("two")));
    });

    it("is a SHA-256 in hex, padded to 64 characters", async () => {
        expect(await hashBlob(png("abc"))).toBe(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
        expect(await hashBlob(png(""))).toHaveLength(64);
    });

    it("looks at the bytes, not at the type of the blob", async () => {
        const a = new Blob(["bytes"], { type: "image/png" });
        const b = new Blob(["bytes"], { type: "application/octet-stream" });

        expect(await hashBlob(a)).toBe(await hashBlob(b));
    });

    it("rejects where the browser has no crypto.subtle", async () => {
        vi.stubGlobal("crypto", {});

        await expect(hashBlob(png("x"))).rejects.toThrow();
    });
});
