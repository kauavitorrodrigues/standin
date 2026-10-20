import { describe, expect, it, vi } from "vitest";
import { AvatarSheetBinder } from "../AvatarSheetBinder";

const setup = () => {
    const releases: string[] = [];
    const callbacks = new Map<string, (textureKey: string) => void>();
    const source = {
        acquire: vi.fn(
            (fileId: string | null, onChange: (key: string) => void) => {
                const key = fileId === null ? "ghost" : `sheet:${fileId}`;
                if (fileId !== null) callbacks.set(fileId, onChange);
                return {
                    getKey: () => "ghost",
                    release: () => releases.push(key),
                };
            }
        ),
    };
    return {
        source,
        releases,
        callbacks,
        binder: new AvatarSheetBinder(source),
    };
};

describe("AvatarSheetBinder", () => {
    it("shows what the lease gives right away", () => {
        const { binder } = setup();
        const target = { setTexture: vi.fn() };

        binder.bind("local", target, "file-1");

        expect(target.setTexture).toHaveBeenCalledWith("ghost");
        expect(binder.getFileId("local")).toBe("file-1");
    });

    it("swaps the sprite when the sheet becomes ready", () => {
        const { binder, callbacks } = setup();
        const target = { setTexture: vi.fn() };
        binder.bind("local", target, "file-1");

        callbacks.get("file-1")?.("sheet:file-1");

        expect(target.setTexture).toHaveBeenLastCalledWith("sheet:file-1");
    });

    it("does nothing when bound again to the same sheet", () => {
        const { binder, source } = setup();
        const target = { setTexture: vi.fn() };
        binder.bind("local", target, "file-1");

        binder.bind("local", target, "file-1");

        expect(source.acquire).toHaveBeenCalledTimes(1);
    });

    it("acquires the new sheet before it releases the old one", () => {
        const { binder, source, releases } = setup();
        const target = { setTexture: vi.fn() };
        binder.bind("local", target, "file-1");

        binder.bind("local", target, "file-2");

        expect(source.acquire).toHaveBeenCalledTimes(2);
        expect(releases).toEqual(["sheet:file-1"]);
    });

    it("goes back to the ghost when the avatar is cleared", () => {
        const { binder, source, releases } = setup();
        const target = { setTexture: vi.fn() };
        binder.bind("local", target, "file-1");

        binder.bind("local", target, null);

        expect(source.acquire).toHaveBeenLastCalledWith(
            null,
            expect.any(Function)
        );
        expect(binder.getFileId("local")).toBeNull();
        expect(releases).toEqual(["sheet:file-1"]);
    });

    it("releases one avatar or all of them", () => {
        const { binder, releases } = setup();
        const target = { setTexture: vi.fn() };
        binder.bind("a", target, "file-1");
        binder.bind("b", target, "file-2");

        binder.release("a");
        expect(releases).toEqual(["sheet:file-1"]);
        expect(binder.getFileId("a")).toBeUndefined();

        binder.releaseAll();
        expect(releases).toEqual(["sheet:file-1", "sheet:file-2"]);
    });
});
