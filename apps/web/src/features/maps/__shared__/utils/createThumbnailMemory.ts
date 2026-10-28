import type { ThumbnailMemory } from "@/features/maps/__shared__/types/thumbnailMemory";

export const createThumbnailMemory = (): ThumbnailMemory => ({
    hash: null,
    queue: Promise.resolve(),
});
