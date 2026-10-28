import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalDiskStorageProvider } from "../LocalDiskStorageProvider";

let dir: string;

beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "standin-storage-"));
});

afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
});

describe("LocalDiskStorageProvider.delete", () => {
    it("removes the file", async () => {
        const provider = new LocalDiskStorageProvider(dir, "http://x");
        await provider.upload(Buffer.from("a"), "a/b.png");

        await provider.delete("a/b.png");

        await expect(fs.access(path.join(dir, "a/b.png"))).rejects.toThrow();
    });

    it("resolves when the file is already gone, like the S3 driver", async () => {
        const provider = new LocalDiskStorageProvider(dir, "http://x");

        await expect(provider.delete("missing.png")).resolves.toBeUndefined();
    });
});
