import { describe, expect, it, vi } from "vitest";
import { AVATAR_GHOST_TEXTURE_KEY } from "../../consts/textures";
import { AvatarTextureRegistry } from "../AvatarTextureRegistry";
import { listAvatarAnimationKeys } from "../registerAvatarAnimations";
import { createFakeAvatarHost } from "./fakeAvatarHost";

const KEY = "avatar-sheet:file-1";

const setup = () => {
    const fake = createFakeAvatarHost();
    const registry = new AvatarTextureRegistry(
        fake.host,
        (fileId) => `/files/${fileId}`
    );
    return { fake, registry };
};

describe("AvatarTextureRegistry", () => {
    it("gives the ghost to an avatar without a sheet and loads nothing", () => {
        const { fake, registry } = setup();

        const lease = registry.acquire(null);

        expect(lease.getKey()).toBe(AVATAR_GHOST_TEXTURE_KEY);
        expect(fake.mocks.load.spritesheet).not.toHaveBeenCalled();
        lease.release();
    });

    it("draws the ghost until the sheet is ready, then switches", () => {
        const { fake, registry } = setup();
        const onChange = vi.fn();

        const lease = registry.acquire("file-1", onChange);
        expect(lease.getKey()).toBe(AVATAR_GHOST_TEXTURE_KEY);

        fake.finishLoad(KEY);

        expect(lease.getKey()).toBe(KEY);
        expect(onChange).toHaveBeenCalledWith(KEY);
        listAvatarAnimationKeys(KEY).forEach((animationKey) =>
            expect(fake.animations.has(animationKey)).toBe(true)
        );
    });

    it("creates the texture once per file for many avatars", () => {
        const { fake, registry } = setup();

        const first = registry.acquire("file-1");
        const second = registry.acquire("file-1");
        fake.finishLoad(KEY);

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(1);
        expect(registry.getReferenceCount("file-1")).toBe(2);
        expect(first.getKey()).toBe(KEY);
        expect(second.getKey()).toBe(KEY);
    });

    it("destroys the texture and its animations when the last avatar lets go", () => {
        const { fake, registry } = setup();
        const first = registry.acquire("file-1");
        const second = registry.acquire("file-1");
        fake.finishLoad(KEY);

        first.release();
        expect(fake.textures.has(KEY)).toBe(true);

        second.release();
        expect(fake.textures.has(KEY)).toBe(false);
        expect(fake.animations.size).toBe(0);
        expect(registry.getReferenceCount("file-1")).toBe(0);
    });

    it("counts a release only once", () => {
        const { fake, registry } = setup();
        const first = registry.acquire("file-1");
        const second = registry.acquire("file-1");
        fake.finishLoad(KEY);

        first.release();
        first.release();

        expect(registry.getReferenceCount("file-1")).toBe(1);
        expect(fake.textures.has(KEY)).toBe(true);
        second.release();
    });

    it("falls back to the ghost when the sheet is gone (404) and does not break", () => {
        const { fake, registry } = setup();
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const onChange = vi.fn();

        const lease = registry.acquire("file-1", onChange);
        fake.failLoad(KEY);

        expect(lease.getKey()).toBe(AVATAR_GHOST_TEXTURE_KEY);
        expect(onChange).toHaveBeenCalledWith(AVATAR_GHOST_TEXTURE_KEY);
        expect(() => lease.release()).not.toThrow();
        expect(fake.mocks.textures.remove).not.toHaveBeenCalled();
        error.mockRestore();
    });

    it("drops a texture that arrives after everybody let go", () => {
        const { fake, registry } = setup();
        const lease = registry.acquire("file-1");

        lease.release();
        fake.finishLoad(KEY);

        expect(fake.textures.has(KEY)).toBe(false);
        expect(registry.getReferenceCount("file-1")).toBe(0);
    });

    it("keeps the texture when someone asks for it again while it loads", () => {
        const { fake, registry } = setup();
        const first = registry.acquire("file-1");
        first.release();

        const second = registry.acquire("file-1");
        fake.finishLoad(KEY);

        expect(fake.textures.has(KEY)).toBe(true);
        expect(second.getKey()).toBe(KEY);
        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(1);
    });

    it("loads it again after it was destroyed", () => {
        const { fake, registry } = setup();
        const first = registry.acquire("file-1");
        fake.finishLoad(KEY);
        first.release();

        const second = registry.acquire("file-1");
        fake.finishLoad(KEY);

        expect(fake.mocks.load.spritesheet).toHaveBeenCalledTimes(2);
        expect(second.getKey()).toBe(KEY);
    });

    it("returns to the baseline texture count after 50 avatars leave", () => {
        const { fake, registry } = setup();
        const baseline = fake.textures.size;
        const leases = Array.from({ length: 50 }, (_, index) => {
            const fileId = `file-${index % 10}`;
            return registry.acquire(fileId);
        });
        for (let index = 0; index < 10; index += 1) {
            fake.finishLoad(`avatar-sheet:file-${index}`);
        }
        expect(fake.textures.size).toBe(baseline + 10);

        leases.forEach((lease) => lease.release());

        expect(fake.textures.size).toBe(baseline);
        expect(fake.animations.size).toBe(0);
        for (let index = 0; index < 10; index += 1) {
            expect(registry.getReferenceCount(`file-${index}`)).toBe(0);
        }
    });
});
