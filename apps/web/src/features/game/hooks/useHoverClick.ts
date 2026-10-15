import { useEffect } from "react";
import { useAsRef } from "@/hooks/useAsRef";
import type { GameEngineHandle } from "@/features/game/types/game";

// Runs `onClick` with the id of the target the mouse clicked, or null for the
// empty map, on the hover event of one kind of target. A press that dragged the camera is no click.
export const useHoverClick = (
    handle: GameEngineHandle | null,
    event: string,
    onClick: (id: string | null) => void
) => {
    const onClickRef = useAsRef(onClick);

    useEffect(() => {
        if (!handle) return;

        return handle.subscribeToHoverClick(event, (id) =>
            onClickRef.current(id)
        );
    }, [handle, event, onClickRef]);
};
