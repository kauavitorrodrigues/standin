import { describe, expect, it, vi } from "vitest";
import { EMOTE_TEXTURE } from "@/features/game/consts/emote";
import type { EmojiTextureHost } from "@/features/game/types/emote";
import { EmojiTextureCache } from "../EmojiTextureCache";

const FILTER = 0;

const createHost = () => {
    const keys = new Set<string>();
    const context = {
        font: "",
        textAlign: "",
        textBaseline: "",
        fillText: vi.fn(),
    };
    const host: EmojiTextureHost = {
        textures: {
            exists: (key) => keys.has(key),
            remove: vi.fn((key: string) => keys.delete(key)),
            createCanvas: vi.fn((key: string) => {
                keys.add(key);
                return {
                    context: context as unknown as CanvasRenderingContext2D,
                    refresh: vi.fn(),
                    setFilter: vi.fn(),
                };
            }),
        },
    };
    return { host, keys, context };
};

const emojiAt = (index: number) => `emoji-${index}`;

describe("EmojiTextureCache", () => {
    it("draws an emoji once and reuses its texture", () => {
        const { host, context } = createHost();
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });

        const first = cache.get("👏", 0);
        const second = cache.get("👏", 10);

        expect(first).toBe(`${EMOTE_TEXTURE.KEY_PREFIX}👏`);
        expect(second).toBe(first);
        expect(host.textures.createCanvas).toHaveBeenCalledTimes(1);
        expect(context.fillText).toHaveBeenCalledTimes(1);
    });

    it("fills the cache up to the limit", () => {
        const { host, keys } = createHost();
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });

        for (let index = 0; index < EMOTE_TEXTURE.MAX_TEXTURES; index += 1) {
            expect(cache.get(emojiAt(index), 0)).not.toBeNull();
        }
        expect(keys.size).toBe(EMOTE_TEXTURE.MAX_TEXTURES);
    });

    it("skips a new emoji when every texture was used a moment ago", () => {
        const { host, keys } = createHost();
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });
        for (let index = 0; index < EMOTE_TEXTURE.MAX_TEXTURES; index += 1) {
            cache.get(emojiAt(index), 0);
        }

        expect(cache.get("new", EMOTE_TEXTURE.MIN_IDLE_MS - 1)).toBeNull();
        expect(keys.size).toBe(EMOTE_TEXTURE.MAX_TEXTURES);
    });

    it("takes away the least used texture once it has been idle", () => {
        const { host, keys } = createHost();
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });
        for (let index = 0; index < EMOTE_TEXTURE.MAX_TEXTURES; index += 1) {
            cache.get(emojiAt(index), index);
        }

        const now = EMOTE_TEXTURE.MIN_IDLE_MS;
        expect(cache.get("new", now)).toBe(
            `${EMOTE_TEXTURE.KEY_PREFIX}new`
        );
        expect(keys.has(`${EMOTE_TEXTURE.KEY_PREFIX}${emojiAt(0)}`)).toBe(
            false
        );
        expect(keys.size).toBe(EMOTE_TEXTURE.MAX_TEXTURES);
    });

    it("skips the emoji when the canvas can not be made", () => {
        const { host } = createHost();
        vi.mocked(host.textures.createCanvas).mockReturnValueOnce(null);
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });

        expect(cache.get("👏", 0)).toBeNull();
    });

    it("removes every texture when destroyed", () => {
        const { host, keys } = createHost();
        const cache = new EmojiTextureCache({ host, filterMode: FILTER });
        cache.get("👏", 0);
        cache.get("🎉", 0);

        cache.destroy();

        expect(keys.size).toBe(0);
    });
});
