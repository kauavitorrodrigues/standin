import { useEffect, useRef } from "react";
import type { StageTile } from "@/features/spaces/types/stage";

type AutoPinScreenOptions = {
    tiles: readonly StageTile[];
    pin: (tileId: string) => void;
    openGrid: () => void;
};

// When a screen share appears among the strongly connected users (false to
// true), the first screen is pinned and the meeting view opens. The grid is
// our mapping of the meeting view. It fires on mount too (fireImmediately). A second screen
// while one is already shown does not pin again.
export const useAutoPinScreen = ({
    tiles,
    pin,
    openGrid,
}: AutoPinScreenOptions) => {
    const firstScreenId =
        tiles.find((tile) => tile.slot === "screen" && !tile.isSelf)?.id ??
        null;
    const hadScreen = useRef(false);

    useEffect(() => {
        const previous = hadScreen.current;
        hadScreen.current = firstScreenId !== null;
        if (previous || firstScreenId === null) return;

        pin(firstScreenId);
        openGrid();
    }, [firstScreenId, pin, openGrid]);
};
