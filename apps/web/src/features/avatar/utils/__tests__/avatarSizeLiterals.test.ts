import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLOW_MARKER, findAvatarSizeLiterals } from "./findAvatarSizeLiterals";

// The size of the avatar lives in `packages/contracts/src/avatar/consts/
// dimensions.ts`, and nowhere else. This test reads the source of the web app
// and fails when a size shows up as a literal, so a change of the frame or of
// the body is a change in one file.
const WEB_ROOT = resolve(import.meta.dirname, "../../../../..");

// Folders scanned. The tileset and the editor features draw the avatar in
// their previews, so they are scanned too.
const SCANNED_DIRECTORIES = [
    "src/features/game",
    "src/features/avatar",
    "src/features/tilesets",
    "src/features/editor",
    "scripts",
];

// Files that may hold such numbers, and why. Keep this list short. Prefer the
// marker `avatar-size-ok` on one line over a whole file here.
const EXCEPTIONS: Record<string, string> = {
    "src/features/avatar/consts/sheet-art.ts":
        "Pixel matrices of the generated art, they are the drawing itself.",
    "src/features/game/consts/name-tag.ts":
        "Sizes of the name tag in px, which is not part of the avatar frame.",
};

const SOURCE_FILE = /\.(ts|tsx|cts)$/;

const isTestFile = (path: string): boolean =>
    path.includes("__tests__") ||
    path.includes(".test.") ||
    path.includes(".spec.");

const listSources = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return listSources(path);
        return SOURCE_FILE.test(entry.name) ? [path] : [];
    });

const toWebPath = (path: string): string =>
    relative(WEB_ROOT, path).split("\\").join("/");

describe("avatar size literals", () => {
    it("finds no size of the avatar outside dimensions.ts", () => {
        const offenders = SCANNED_DIRECTORIES.flatMap((directory) =>
            listSources(resolve(WEB_ROOT, directory)).flatMap((path) => {
                const webPath = toWebPath(path);
                if (isTestFile(webPath)) return [];
                if (webPath in EXCEPTIONS) return [];

                return findAvatarSizeLiterals(readFileSync(path, "utf8")).map(
                    (hit) => `${webPath}:${hit.line}  ${hit.text}`
                );
            })
        );

        expect(
            offenders,
            "Import AVATAR from @standin/contracts instead of writing the size."
        ).toEqual([]);
    });

    it("scans real files", () => {
        const scanned = SCANNED_DIRECTORIES.flatMap((directory) =>
            listSources(resolve(WEB_ROOT, directory))
        );

        expect(scanned.length).toBeGreaterThan(50);
    });

    it("lists only exceptions that still exist", () => {
        Object.keys(EXCEPTIONS).forEach((webPath) => {
            expect(existsSync(resolve(WEB_ROOT, webPath)), webPath).toBe(true);
        });
    });

    describe("the scanner", () => {
        it("catches the sizes of the frame and of the body next to the avatar", () => {
            const source = [
                "sprite.setSize(32, 48);",
                "const playerWidth = 24;",
                "this.body.setOffset(8, 16);",
                "const avatarHeight = 48;",
            ].join("\n");

            expect(
                findAvatarSizeLiterals(source).map((hit) => hit.line)
            ).toEqual([1, 2, 3, 4]);
        });

        it("ignores sizes that are not about the avatar", () => {
            const source = [
                "const gap = 16;",
                "const player = TILE_SIZE * 2;",
                "const avatarColor = 0x3248ff;",
                'const className = "p-16 avatar-24px";',
                "const ratio = avatar.scale * 1.32;",
            ].join("\n");

            expect(findAvatarSizeLiterals(source)).toEqual([]);
        });

        it("ignores comments, TILE_SIZE lines and the allow marker", () => {
            const source = [
                "// the avatar is 32 px wide",
                " * the player is 48 px tall",
                "const a = TILE_SIZE + 32; // avatar",
                `const avatarGap = 16; // ${ALLOW_MARKER}: spacing of the list`,
            ].join("\n");

            expect(findAvatarSizeLiterals(source)).toEqual([]);
        });
    });
});
