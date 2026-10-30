import { describe, expect, it } from "vitest";
import { formatBytes } from "../formatBytes";
import { formatIssue } from "../formatIssue";
import { isPng } from "../isPng";
import { joinIssuePath } from "../joinIssuePath";
import { readApiIssues } from "../readApiIssues";
import { isSafeRelativePath } from "../../commands/content/shared/isSafeRelativePath";

describe("isPng", () => {
    it("accepts the signature of a PNG and nothing shorter or different", () => {
        expect(
            isPng(
                Uint8Array.from([
                    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                ])
            )
        ).toBe(true);
        expect(isPng(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
        expect(isPng(new TextEncoder().encode("GIF89a......"))).toBe(false);
        expect(isPng(new Uint8Array())).toBe(false);
    });
});

describe("joinIssuePath", () => {
    it("writes keys with dots and indexes with brackets", () => {
        expect(joinIssuePath(["tilesets", 0, "file"])).toBe("tilesets[0].file");
        expect(joinIssuePath([])).toBe("");
        expect(joinIssuePath(["a", "b"])).toBe("a.b");
    });
});

describe("formatIssue", () => {
    it("starts with the file", () => {
        expect(
            formatIssue({
                file: "library.json",
                path: "tilesets[0].name",
                message: "required",
            })
        ).toBe("library.json tilesets[0].name: required");
        expect(formatIssue({ file: "a.png", message: "it is not a PNG" })).toBe(
            "a.png: it is not a PNG"
        );
    });
});

describe("readApiIssues", () => {
    it("reads the lists of a library seed error", () => {
        expect(
            readApiIssues({
                issues: ["one", 2, "three"],
                paths: ["a.png"],
            })
        ).toEqual([
            { message: "one" },
            { message: "three" },
            { file: "a.png", message: "the file was not uploaded" },
        ]);
    });

    it("ignores lists that are not lists", () => {
        expect(readApiIssues({ issues: "x", paths: { a: 1 } })).toEqual([]);
    });
});

describe("formatBytes", () => {
    it("picks the unit", () => {
        expect(formatBytes(12)).toBe("12 B");
        expect(formatBytes(2048)).toBe("2 KB");
        expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
    });
});

describe("isSafeRelativePath", () => {
    it("allows paths inside the folder and refuses the others", () => {
        expect(isSafeRelativePath("tilesets/floor.png")).toBe(true);
        expect(isSafeRelativePath("assets/café.png")).toBe(true);
        expect(isSafeRelativePath("../floor.png")).toBe(false);
        expect(isSafeRelativePath("a/../../b.png")).toBe(false);
        expect(isSafeRelativePath("/etc/x.png")).toBe(false);
    });
});
