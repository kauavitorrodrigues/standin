import { describe, expect, it, vi } from "vitest";
import { AVATAR } from "@standin/contracts";
import { ensureAvatarTexture } from "../ensureAvatarTexture";
import { createFakeAvatarHost } from "./fakeAvatarHost";

const handlers = () => ({ onReady: vi.fn(), onError: vi.fn() });

describe("ensureAvatarTexture", () => {
    it("loads the sheet as a spritesheet of the frame size and tells when it is ready", () => {
        const fake = createFakeAvatarHost();
        const first = handlers();

        ensureAvatarTexture(
            fake.host,
            { key: "avatar-sheet:a", url: "/files/a" },
            first
        );

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledWith(
            "avatar-sheet:a",
            "/files/a",
            { frameWidth: AVATAR.frame.w, frameHeight: AVATAR.frame.h }
        );
        expect(fake.mocks.load.start).toHaveBeenCalledTimes(1);
        expect(first.onReady).not.toHaveBeenCalled();

        fake.finishLoad("avatar-sheet:a");

        expect(first.onReady).toHaveBeenCalledTimes(1);
        expect(first.onError).not.toHaveBeenCalled();
    });

    it("asks for a sheet once when two avatars want it at the same time", () => {
        const fake = createFakeAvatarHost();
        const first = handlers();
        const second = handlers();
        const request = { key: "avatar-sheet:a", url: "/files/a" };

        ensureAvatarTexture(fake.host, request, first);
        ensureAvatarTexture(fake.host, request, second);
        fake.finishLoad("avatar-sheet:a");

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(1);
        expect(first.onReady).toHaveBeenCalledTimes(1);
        expect(second.onReady).toHaveBeenCalledTimes(1);
    });

    it("is ready at once for a texture that already exists", () => {
        const fake = createFakeAvatarHost();
        fake.textures.add("avatar-sheet:a");
        const first = handlers();

        ensureAvatarTexture(
            fake.host,
            { key: "avatar-sheet:a", url: "/files/a" },
            first
        );

        expect(first.onReady).toHaveBeenCalledTimes(1);
        expect(fake.mocks.load.spritesheet).not.toHaveBeenCalled();
    });

    it("reports an error for its own sheet only, a 404 included", () => {
        const fake = createFakeAvatarHost();
        const first = handlers();
        ensureAvatarTexture(
            fake.host,
            { key: "avatar-sheet:a", url: "/files/a" },
            first
        );

        fake.failLoad("some-other-file");
        expect(first.onError).not.toHaveBeenCalled();

        fake.failLoad("avatar-sheet:a");
        expect(first.onError).toHaveBeenCalledTimes(1);
        expect(first.onReady).not.toHaveBeenCalled();
    });

    it("removes its listeners once the load settles", () => {
        const fake = createFakeAvatarHost();
        ensureAvatarTexture(
            fake.host,
            { key: "avatar-sheet:a", url: "/files/a" },
            handlers()
        );

        fake.finishLoad("avatar-sheet:a");

        expect(fake.listenerCount("loaderror")).toBe(0);
        expect(
            fake.listenerCount("filecomplete-spritesheet-avatar-sheet:a")
        ).toBe(0);
    });

    it("can try again after a failure", () => {
        const fake = createFakeAvatarHost();
        const request = { key: "avatar-sheet:a", url: "/files/a" };
        ensureAvatarTexture(fake.host, request, handlers());
        fake.failLoad("avatar-sheet:a");

        const retry = handlers();
        ensureAvatarTexture(fake.host, request, retry);
        fake.finishLoad("avatar-sheet:a");

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(2);
        expect(retry.onReady).toHaveBeenCalledTimes(1);
    });

    it("leaves the loader to the scene when autoStart is off", () => {
        const fake = createFakeAvatarHost();

        ensureAvatarTexture(
            fake.host,
            { key: "avatar-sheet:a", url: "/files/a", autoStart: false },
            handlers()
        );

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(1);
        expect(fake.mocks.load.start).not.toHaveBeenCalled();
    });
});
