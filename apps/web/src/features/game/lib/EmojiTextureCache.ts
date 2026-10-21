import { EMOTE_TEXTURE } from "@/features/game/consts/emote";
import type { EmojiTextureHost } from "@/features/game/types/emote";
import { buildEmojiTextureKey } from "@/features/game/utils/buildEmojiTextureKey";
import { drawEmoji } from "@/features/game/utils/drawEmoji";
import { findEvictableTexture } from "@/features/game/utils/findEvictableTexture";

type Options = {
    host: EmojiTextureHost;
    // The filter that smooths the canvas when it is shown smaller.
    filterMode: number;
};

/**
 * Keeps the canvas textures of the emojis. The cache has a limit: when it is
 * full the texture least used goes, as long as it has been idle for a while.
 * When none has, the emoji is skipped, which is better than leaking memory.
 */
export class EmojiTextureCache {
    private readonly host: EmojiTextureHost;
    private readonly filterMode: number;
    private readonly lastUsedAt = new Map<string, number>();

    constructor({ host, filterMode }: Options) {
        this.host = host;
        this.filterMode = filterMode;
    }

    // The key of the texture of the emoji, or null when there is no room for
    // it. `now` is the scene time in ms.
    get(emoji: string, now: number): string | null {
        const key = buildEmojiTextureKey(emoji);
        if (this.lastUsedAt.has(key) && this.host.textures.exists(key)) {
            this.lastUsedAt.set(key, now);
            return key;
        }

        if (this.lastUsedAt.size >= EMOTE_TEXTURE.MAX_TEXTURES) {
            if (!this.evictOne(now)) return null;
        }

        if (!this.create(key, emoji)) return null;

        this.lastUsedAt.set(key, now);
        return key;
    }

    destroy(): void {
        this.lastUsedAt.forEach((_at, key) => this.host.textures.remove(key));
        this.lastUsedAt.clear();
    }

    private create(key: string, emoji: string): boolean {
        const { SIZE } = EMOTE_TEXTURE;
        const canvas = this.host.textures.createCanvas(key, SIZE, SIZE);
        if (!canvas) return false;

        drawEmoji(canvas.context, emoji);
        canvas.refresh();
        canvas.setFilter(this.filterMode);
        return true;
    }

    private evictOne(now: number): boolean {
        const key = findEvictableTexture(
            this.lastUsedAt,
            now,
            EMOTE_TEXTURE.MIN_IDLE_MS
        );
        if (key === null) return false;

        this.host.textures.remove(key);
        this.lastUsedAt.delete(key);
        return true;
    }
}
