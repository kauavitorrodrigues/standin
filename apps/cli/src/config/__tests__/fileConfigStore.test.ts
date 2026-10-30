import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigFileInvalidError } from "../../errors/ConfigFileInvalidError";
import { ConfigFileUnreadableError } from "../../errors/ConfigFileUnreadableError";
import { toErrorReport } from "../../errors/toErrorReport";
import { createFileConfigStore } from "../createFileConfigStore";
import { resolveConfigPath } from "../resolveConfigPath";

const mode = (target: string): number => fs.statSync(target).mode & 0o777;

describe("the login file", () => {
    let home: string;

    beforeEach(() => {
        home = fs.mkdtempSync(path.join(os.tmpdir(), "standin-config-"));
    });

    afterEach(() => {
        fs.rmSync(home, { recursive: true, force: true });
    });

    const store = () => createFileConfigStore({ XDG_CONFIG_HOME: home });

    it("lives under $XDG_CONFIG_HOME/standin", () => {
        expect(store().path).toBe(path.join(home, "standin", "config.json"));
    });

    it("falls back to ~/.config", () => {
        expect(resolveConfigPath({ HOME: "/home/ana" })).toBe(
            "/home/ana/.config/standin/config.json"
        );
    });

    it("writes the file for its owner only and the folder too", async () => {
        const { path: file, write } = store();
        await write({ url: "https://x.test", token: "sit_secret" });

        expect(mode(file)).toBe(0o600);
        expect(mode(path.dirname(file))).toBe(0o700);
        expect(JSON.parse(fs.readFileSync(file, "utf8"))).toEqual({
            url: "https://x.test",
            token: "sit_secret",
        });
    });

    it("tightens a file that already existed with a wider mode", async () => {
        const { path: file, write } = store();
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, "{}", { mode: 0o644 });
        fs.chmodSync(file, 0o644);

        await write({ url: "https://x.test", token: "t" });

        expect(mode(file)).toBe(0o600);
    });

    it("reads back what was written", async () => {
        const target = store();
        await target.write({ url: "https://x.test", token: "t" });

        await expect(target.read()).resolves.toEqual({
            url: "https://x.test",
            token: "t",
        });
    });

    it("reads nothing when there is no file", async () => {
        await expect(store().read()).resolves.toBeUndefined();
    });

    it("refuses a file that is not what login writes, without echoing it", async () => {
        const target = store();
        fs.mkdirSync(path.dirname(target.path), { recursive: true });
        fs.writeFileSync(target.path, '{"token": 5, "extra": "sit_leak"}');

        const error = await target.read().catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ConfigFileInvalidError);
        expect(JSON.stringify((error as Error).message)).not.toContain(
            "sit_leak"
        );
    });

    it("refuses a file that is not JSON", async () => {
        const target = store();
        fs.mkdirSync(path.dirname(target.path), { recursive: true });
        fs.writeFileSync(target.path, "not json");

        await expect(target.read()).rejects.toBeInstanceOf(
            ConfigFileInvalidError
        );
    });

    it("deletes the file, and says when there was none", async () => {
        const target = store();
        await target.write({ url: "https://x.test", token: "t" });

        await expect(target.remove()).resolves.toBe(true);
        expect(fs.existsSync(target.path)).toBe(false);
        await expect(target.remove()).resolves.toBe(false);
    });

    describe("the login file, when things go wrong", () => {
        let home: string;

        beforeEach(() => {
            home = fs.mkdtempSync(path.join(os.tmpdir(), "standin-config-"));
        });

        afterEach(() => {
            fs.rmSync(home, { recursive: true, force: true });
        });

        const store = () => createFileConfigStore({ XDG_CONFIG_HOME: home });

        it("ends 0600 when the file existed with the mode 0644", async () => {
            const { path: file, write } = store();
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, "{}", { mode: 0o644 });
            fs.chmodSync(file, 0o644);

            await write({ url: "https://x.test", token: "t" });

            expect(mode(file)).toBe(0o600);
            expect(JSON.parse(fs.readFileSync(file, "utf8")).token).toBe("t");
        });

        it("leaves no temporary file behind", async () => {
            const { path: file, write } = store();
            await write({ url: "https://x.test", token: "t" });

            expect(fs.readdirSync(path.dirname(file))).toEqual(["config.json"]);
        });

        it("cleans its temporary file when the rename fails", async () => {
            const { path: file, write } = store();
            // A folder where the file goes: the rename of a file over it fails.
            fs.mkdirSync(file, { recursive: true });
            fs.writeFileSync(path.join(file, "keep"), "x");

            await expect(
                write({ url: "https://x.test", token: "t" })
            ).rejects.toBeDefined();
            expect(
                fs
                    .readdirSync(path.dirname(file))
                    .filter((n) => n.endsWith(".tmp"))
            ).toEqual([]);
        });

        it("says so when the file is a folder, on read and on remove", async () => {
            const target = store();
            fs.mkdirSync(target.path, { recursive: true });

            for (const run of [target.read, target.remove]) {
                const error = await run().catch((e: unknown) => e);
                expect(error).toBeInstanceOf(ConfigFileUnreadableError);
                expect(toErrorReport(error)).toMatchObject({
                    code: "CLI_CONFIG_FILE_UNREADABLE",
                    path: target.path,
                });
                expect(toErrorReport(error).fix).toBeDefined();
            }
        });

        it("says so when a part of the path is a file (ENOTDIR)", async () => {
            const blocker = path.join(home, "blocker");
            fs.writeFileSync(blocker, "x");
            const target = createFileConfigStore({ XDG_CONFIG_HOME: blocker });

            const error = await target.read().catch((e: unknown) => e);
            expect(error).toBeInstanceOf(ConfigFileUnreadableError);
            expect((error as Error).message).toContain("ENOTDIR");
        });

        it("says so when the file cannot be opened (EACCES)", async () => {
            const target = store();
            await target.write({ url: "https://x.test", token: "t" });
            fs.chmodSync(target.path, 0o000);
            // Root reads anything, so the check only means something for others.
            const canRead = (() => {
                try {
                    fs.readFileSync(target.path);
                    return true;
                } catch {
                    return false;
                }
            })();
            if (canRead) return;

            await expect(target.read()).rejects.toBeInstanceOf(
                ConfigFileUnreadableError
            );
        });

        it("ignores a relative XDG_CONFIG_HOME", () => {
            expect(
                resolveConfigPath({
                    XDG_CONFIG_HOME: "relative/dir",
                    HOME: "/home/ana",
                })
            ).toBe("/home/ana/.config/standin/config.json");
        });
    });
});
