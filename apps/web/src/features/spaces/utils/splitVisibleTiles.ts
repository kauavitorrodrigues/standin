import type { StageCarousel, StageTile } from "@/features/spaces/types/stage";

// The stage shows `pageSize` tiles at a time (CAROUSEL_SIZE) and pages through the rest. Order is
// kept, so screens, which come first, land on the first page. An index past
// the last page (someone left) is clamped instead of showing an empty page.
// Pinned tiles jump the pagination and show on every page, but they take
// slots from the same `pageSize` ceiling, not extra ones.
export const splitVisibleTiles = (
    tiles: readonly StageTile[],
    pageSize: number,
    carouselIndex: number,
    pinnedIds: readonly string[] = []
): StageCarousel => {
    const pinned = pinnedIds
        .map((id) => tiles.find((tile) => tile.id === id))
        .filter((tile): tile is StageTile => tile !== undefined)
        .slice(0, pageSize);
    const pinnedSet = new Set(pinned.map((tile) => tile.id));
    const unpinned = tiles.filter((tile) => !pinnedSet.has(tile.id));
    const slots = pageSize - pinned.length;

    const pageCount =
        slots > 0 ? Math.max(1, Math.ceil(unpinned.length / slots)) : 1;
    const index = Math.min(Math.max(0, carouselIndex), pageCount - 1);
    const visible = [
        ...pinned,
        ...unpinned.slice(index * slots, (index + 1) * slots),
    ];

    return {
        carouselIndex: index,
        pageCount,
        visible,
        hiddenCount: tiles.length - visible.length,
    };
};
