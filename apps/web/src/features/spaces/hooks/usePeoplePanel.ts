import { useState } from "react";
import { SIDE_PANEL_TRANSITION_MS } from "@/consts/sidePanel";
import { usePresence } from "@/hooks/usePresence";
import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";

type PeoplePanelOptions = {
    view: SpaceView;
    selectView: (view: SpaceView) => void;
};

export const usePeoplePanel = ({ view, selectView }: PeoplePanelOptions) => {
    const [isPeopleOpen, setIsPeopleOpen] = useState(false);
    // The panel pushes the office aside, so it only exists on that view.
    const isVisible = isPeopleOpen && view === SPACE_VIEWS.SPACE;
    // Stays mounted while it slides out, and the content stays shifted until
    // it is gone.
    const { isMounted, isExiting } = usePresence(
        isVisible,
        SIDE_PANEL_TRANSITION_MS
    );
    // The panel sits beside the office, so asking for it from another view
    // (the chat) goes back to the office first instead of opening it hidden.
    const toggle = () => {
        if (view !== SPACE_VIEWS.SPACE) {
            selectView(SPACE_VIEWS.SPACE);
            setIsPeopleOpen(true);
            return;
        }
        setIsPeopleOpen((open) => !open);
    };
    const close = () => setIsPeopleOpen(false);

    return { isVisible, isMounted, isClosing: isExiting, toggle, close };
};
