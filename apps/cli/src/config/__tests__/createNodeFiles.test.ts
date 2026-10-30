import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createNodeFiles } from "../createNodeFiles";

describe("createNodeFiles", () => {
    const folder: string = fs.mkdtempSync(
        path.join(os.tmpdir(), "standin-files-")
    );
    fs.mkdirSync(path.join(folder, "templates"));
    fs.writeFileSync(path.join(folder, "library.json"), "{}");
    fs.writeFileSync(path.join(folder, "a.png"), Uint8Array.from([0x89, 0x50]));
    fs.symlinkSync(path.join(folder, "a.png"), path.join(folder, "link.png"));

    afterAll(() => {
        fs.rmSync(folder, { recursive: true, force: true });
    });

    it("lists a folder sorted by name, telling folders from files", async () => {
        expect(await createNodeFiles().listDir(folder)).toEqual([
            { name: "a.png", isDirectory: false, isSymlink: false },
            { name: "library.json", isDirectory: false, isSymlink: false },
            { name: "link.png", isDirectory: false, isSymlink: true },
            { name: "templates", isDirectory: true, isSymlink: false },
        ]);
    });

    it("reads text and bytes", async () => {
        const files = createNodeFiles();

        expect(await files.readText(path.join(folder, "library.json"))).toBe(
            "{}"
        );
        expect(await files.readBytes(path.join(folder, "a.png"))).toEqual(
            Buffer.from([0x89, 0x50])
        );
    });

    it("fails with the code of the system on a folder that is not there", async () => {
        await expect(
            createNodeFiles().listDir(path.join(folder, "nope"))
        ).rejects.toMatchObject({ code: "ENOENT" });
    });

    it("tells the size and the real path of a link", async () => {
        const files = createNodeFiles();
        const link: string = path.join(folder, "link.png");

        expect(await files.fileSize(link)).toBe(2);
        expect(await files.realPath(link)).toBe(
            await files.realPath(path.join(folder, "a.png"))
        );
    });
});
