import { useCallback, useState } from "react";
import {
    CONTROLS_VIEWS,
    type ControlsView,
} from "@/features/spaces/consts/controls-view";

// Which view is open over the control bar. Opening one closes the one that was
// open, the same rule as the expanded view of the bar.
export const useControlsView = () => {
    const [view, setView] = useState<ControlsView>(CONTROLS_VIEWS.NONE);

    const open = useCallback((target: ControlsView) => setView(target), []);
    const toggle = useCallback(
        (target: ControlsView) =>
            setView((current) =>
                current === target ? CONTROLS_VIEWS.NONE : target
            ),
        []
    );
    // Only closes when it is the one that is open, so a late close of a view
    // never shuts the one that took its place.
    const close = useCallback(
        (target: ControlsView) =>
            setView((current) =>
                current === target ? CONTROLS_VIEWS.NONE : current
            ),
        []
    );

    return { view, open, toggle, close };
};

export type ControlsViewState = ReturnType<typeof useControlsView>;
