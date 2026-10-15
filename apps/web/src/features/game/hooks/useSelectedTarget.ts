import { useEffect, useState } from "react";
import type { GameEngineHandle } from "@/features/game/types/game";
import type { HoverState } from "@/features/game/types/hover";

// Where the selected target of one kind is on the canvas, following the
// camera, or null with none selected.
export const useSelectedTarget = (
    handle: GameEngineHandle | null,
    event: string
): HoverState | null => {
    const [selected, setSelected] = useState<HoverState | null>(null);

    useEffect(() => {
        if (!handle) return;

        return handle.subscribeToSelected(event, setSelected);
    }, [handle, event]);

    return selected;
};
