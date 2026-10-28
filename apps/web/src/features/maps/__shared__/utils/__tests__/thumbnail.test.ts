import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_THUMBNAIL_ASPECT_DRIFT } from "@standin/contracts";
import { EDITOR_THUMBNAIL } from "@/features/editor/consts/thumbnail";
import { getThumbnailSize } from "@/features/editor/utils/getThumbnailSize";
import { createThumbnailMemory } from "@/features/maps/__shared__/utils/createThumbnailMemory";
import { hashBlob } from "@/features/maps/__shared__/utils/hashBlob";
import { saveMapThumbnail } from "@/features/maps/__shared__/utils/saveMapThumbnail";

describe("getThumbnailSize", () => {
    it("puts the longest side at the ceiling", () => {
        expect(getThumbnailSize({ width: 3200, height: 3200 })).toEqual({
            width: EDITOR_THUMBNAIL.MAX_SIDE,
            height: EDITOR_THUMBNAIL.MAX_SIDE,
        });
        expect(getThumbnailSize({ width: 3200, height: 1600 })).toEqual({
            width: 640,
            height: 320,
        });
        expect(getThumbnailSize({ width: 1600, height: 3200 })).toEqual({
            width: 320,
            height: 640,
        });
    });

    it("scales small maps up", () => {
        expect(getThumbnailSize({ width: 320, height: 160 })).toEqual({
            width: 640,
            height: 320,
        });
    });

    it("keeps the proportion within the server tolerance", () => {
        const map = { width: 99 * 32, height: 61 * 32 };
        const size = getThumbnailSize(map);
        const drift = Math.abs(
            size.width / size.height / (map.width / map.height) - 1
        );

        expect(drift).toBeLessThan(MAX_THUMBNAIL_ASPECT_DRIFT);
    });

    it("never returns a side below one pixel", () => {
        expect(getThumbnailSize({ width: 100000, height: 1 }).height).toBe(1);
    });
});

describe("saveMapThumbnail", () => {
    const blob = new Blob(["png"]);

    it("saves what was captured", async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        await saveMapThumbnail(() => Promise.resolve(blob), save);

        expect(save).toHaveBeenCalledWith(blob);
    });

    it("swallows a failed capture and does not save", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const save = vi.fn();

        await expect(
            saveMapThumbnail(() => Promise.reject(new Error("x")), save)
        ).resolves.toBeUndefined();
        expect(save).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("swallows a failed save", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const save = vi.fn().mockRejectedValue(new Error("x"));

        await expect(
            saveMapThumbnail(() => Promise.resolve(blob), save)
        ).resolves.toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    describe("with a memory of the last photo saved", () => {
        const photo = (text: string) => new Blob([text], { type: "image/png" });

        let warn: ReturnType<typeof vi.spyOn>;
        beforeEach(() => {
            warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        });
        afterEach(() => {
            warn.mockRestore();
            vi.unstubAllGlobals();
        });

        const saving = (lastSaved = createThumbnailMemory()) => {
            const save = vi.fn().mockResolvedValue(undefined);
            const run = (text: string) =>
                saveMapThumbnail(
                    () => Promise.resolve(photo(text)),
                    save,
                    lastSaved
                );
            return { save, run, lastSaved };
        };

        it("saves the first photo and remembers its fingerprint", async () => {
            const { save, run, lastSaved } = saving();

            await run("a");

            expect(save).toHaveBeenCalledTimes(1);
            expect(lastSaved.hash).toBe(await hashBlob(photo("a")));
        });

        it("does not save a photo equal to the last one saved", async () => {
            const { save, run } = saving();

            await run("a");
            await run("a");

            expect(save).toHaveBeenCalledTimes(1);
        });

        it("saves a photo that changed, and compares the next one with it", async () => {
            const { save, run } = saving();

            await run("a");
            await run("b");
            await run("b");
            await run("a");

            expect(save).toHaveBeenCalledTimes(3);
        });

        it("keeps saving every photo when there is no memory", async () => {
            const save = vi.fn().mockResolvedValue(undefined);

            await saveMapThumbnail(() => Promise.resolve(photo("a")), save);
            await saveMapThumbnail(() => Promise.resolve(photo("a")), save);

            expect(save).toHaveBeenCalledTimes(2);
        });

        it("does not remember a photo whose save failed, so the next one retries", async () => {
            const save = vi
                .fn()
                .mockRejectedValueOnce(new Error("offline"))
                .mockResolvedValue(undefined);
            const lastSaved = createThumbnailMemory();
            const run = () =>
                saveMapThumbnail(
                    () => Promise.resolve(photo("a")),
                    save,
                    lastSaved
                );

            await run();
            expect(lastSaved.hash).toBeNull();
            await run();

            expect(save).toHaveBeenCalledTimes(2);
            expect(lastSaved.hash).toBe(await hashBlob(photo("a")));
        });

        it("keeps the memory of the last photo that worked when a later save fails", async () => {
            const save = vi
                .fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("offline"));
            const lastSaved = createThumbnailMemory();
            const run = (text: string) =>
                saveMapThumbnail(
                    () => Promise.resolve(photo(text)),
                    save,
                    lastSaved
                );

            await run("a");
            await run("b");

            expect(lastSaved.hash).toBe(await hashBlob(photo("a")));
        });

        it("saves anyway when the photo cannot be fingerprinted", async () => {
            vi.stubGlobal("crypto", {});
            const { save, run } = saving();

            await run("a");
            await run("a");

            expect(save).toHaveBeenCalledTimes(2);
        });

        it("does not touch the memory when the capture fails", async () => {
            const save = vi.fn();
            const lastSaved = createThumbnailMemory();
            lastSaved.hash = "previous";

            await saveMapThumbnail(
                () => Promise.reject(new Error("x")),
                save,
                lastSaved
            );

            expect(save).not.toHaveBeenCalled();
            expect(lastSaved.hash).toBe("previous");
        });

        describe("when publishes overlap", () => {
            const deferred = () => {
                let resolve!: () => void;
                const promise = new Promise<void>((r) => (resolve = r));
                return { promise, resolve };
            };

            it("ends with the photo the server got last, even if the answers come out of order", async () => {
                const first = deferred();
                const second = deferred();
                const sent: string[] = [];
                const lastSaved = createThumbnailMemory();
                const save = vi.fn(async (blob: Blob) => {
                    sent.push(await blob.text());
                    await (sent.length === 1 ? first : second).promise;
                });
                const run = (text: string) =>
                    saveMapThumbnail(
                        () => Promise.resolve(photo(text)),
                        save,
                        lastSaved
                    );

                const a = run("x");
                const b = run("y");
                // The second answer would come first without the line.
                second.resolve();
                await vi.waitFor(() => expect(sent).toEqual(["x"]));
                first.resolve();
                await Promise.all([a, b]);

                expect(sent).toEqual(["x", "y"]);
                expect(lastSaved.hash).toBe(await hashBlob(photo("y")));
            });

            it("sends one photo when two identical ones are in line", async () => {
                const { save, run } = saving();
                // A slow upload, so the second would compare before the first
                // was remembered if they were not in line.
                save.mockImplementation(
                    () => new Promise((resolve) => setTimeout(resolve, 20))
                );

                await Promise.all([run("a"), run("a")]);

                expect(save).toHaveBeenCalledTimes(1);
            });

            it("captures when called, not when its turn comes", async () => {
                const gate = deferred();
                const { save, lastSaved } = saving();
                save.mockImplementationOnce(() => gate.promise);
                const capture = vi.fn(() => Promise.resolve(photo("late")));

                const first = saveMapThumbnail(
                    () => Promise.resolve(photo("a")),
                    save,
                    lastSaved
                );
                const second = saveMapThumbnail(capture, save, lastSaved);
                await Promise.resolve();

                expect(capture).toHaveBeenCalledTimes(1);
                gate.resolve();
                await Promise.all([first, second]);
            });

            it("goes on after a save that failed", async () => {
                const save = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("offline"))
                    .mockResolvedValue(undefined);
                const lastSaved = createThumbnailMemory();
                const run = (text: string) =>
                    saveMapThumbnail(
                        () => Promise.resolve(photo(text)),
                        save,
                        lastSaved
                    );

                await Promise.all([run("a"), run("b")]);

                expect(save).toHaveBeenCalledTimes(2);
                expect(lastSaved.hash).toBe(await hashBlob(photo("b")));
            });
        });
    });
});
