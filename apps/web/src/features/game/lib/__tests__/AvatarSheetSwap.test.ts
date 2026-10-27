import { describe, expect, it, vi } from "vitest";
import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import { AvatarTextureRegistry } from "@/features/avatar/lib/AvatarTextureRegistry";
import { createFakeAvatarHost } from "@/features/avatar/lib/__tests__/fakeAvatarHost";
import { AvatarSheetBinder } from "../AvatarSheetBinder";

const KEY_A = "avatar-sheet:a";
const KEY_B = "avatar-sheet:b";

const setup = () => {
    const fake = createFakeAvatarHost();
    const registry = new AvatarTextureRegistry(fake.host, (id) => `/f/${id}`);
    const drawn: string[] = [];
    const target = { setTexture: (key: string) => drawn.push(key) };
    const binder = new AvatarSheetBinder(registry);
    return { fake, registry, binder, target, drawn };
};

describe("AvatarSheetBinder with the real registry", () => {
    it("keeps the old sheet on screen during a swap and releases it after", () => {
        const { fake, registry, binder, target, drawn } = setup();
        binder.bind("p", target, "a");
        fake.finishLoad(KEY_A);

        binder.bind("p", target, "b");
        expect(drawn.at(-1)).toBe(KEY_A);
        expect(fake.textures.has(KEY_A)).toBe(true);

        fake.finishLoad(KEY_B);

        expect(drawn.at(-1)).toBe(KEY_B);
        expect(registry.getReferenceCount("a")).toBe(0);
        expect(fake.textures.has(KEY_A)).toBe(false);
    });

    it("falls back to the ghost and releases the old sheet when the swap fails", () => {
        const { fake, registry, binder, target, drawn } = setup();
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        binder.bind("p", target, "a");
        fake.finishLoad(KEY_A);
        binder.bind("p", target, "b");

        fake.failLoad(KEY_B);

        expect(drawn.at(-1)).toBe(AVATAR_GHOST_TEXTURE_KEY);
        expect(registry.getReferenceCount("a")).toBe(0);
        expect(fake.textures.has(KEY_A)).toBe(false);
        error.mockRestore();
    });

    it("destroys the texture when the last avatar of a sheet is released", () => {
        const { fake, registry, binder, target } = setup();
        binder.bind("p1", target, "a");
        binder.bind("p2", target, "a");
        fake.finishLoad(KEY_A);

        binder.release("p1");
        expect(fake.textures.has(KEY_A)).toBe(true);
        binder.release("p2");

        expect(registry.getReferenceCount("a")).toBe(0);
        expect(fake.textures.has(KEY_A)).toBe(false);
    });
});
