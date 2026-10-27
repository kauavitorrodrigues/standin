import { useCallback, useState } from "react";
import { CAROUSEL_SIZE } from "@/features/spaces/consts/stage";
import type { StageTile } from "@/features/spaces/types/stage";
import { splitVisibleTiles } from "@/features/spaces/utils/splitVisibleTiles";

// Which page of the stage the carousel is on. The index is clamped while
// rendering, so a page that disappears falls back to the last one.
export const useStageCarousel = (
    tiles: readonly StageTile[],
    pinnedIds: readonly string[] = []
) => {
    const [requestedIndex, setRequestedIndex] = useState(0);
    const carousel = splitVisibleTiles(
        tiles,
        CAROUSEL_SIZE,
        requestedIndex,
        pinnedIds
    );
    const { carouselIndex, pageCount } = carousel;

    const goToNextPage = useCallback(
        () => setRequestedIndex(Math.min(carouselIndex + 1, pageCount - 1)),
        [carouselIndex, pageCount]
    );
    const goToPreviousPage = useCallback(
        () => setRequestedIndex(Math.max(carouselIndex - 1, 0)),
        [carouselIndex]
    );

    return { ...carousel, goToNextPage, goToPreviousPage };
};
