import { useEffect, useRef, useState } from "react";
import { usePanelRef, type PanelSize } from "react-resizable-panels";
import { useHotkey } from "@/hooks/useHotkey";
import { TILE_EDITOR_KEYS } from "../../consts/editorKeys";
import {
    PROPERTIES_PANEL_MIN_SIZE,
    PROPERTIES_PANEL_READY_MS,
    PROPERTIES_PANEL_TRANSITION,
} from "../../consts/propertiesPanel";

// The panel of properties (the grid and the info of the tileset) beside the
// editor. The editor is the main thing, so the panel can be folded to give it
// all the width, by a click on its divider, the key, or by pulling the divider
// all the way. It is folded when it has no width left. Folding and opening are
// animated, except while the divider is held, so the panel follows the pointer.
export const usePropertiesPanel = (enabled: boolean) => {
    const propertiesPanelRef = usePanelRef();
    const [open, setOpen] = useState(true);
    // The element of the panel, which gets its transition straight on it: it
    // is the one whose size changes, and it is not set by a class.
    const propertiesPanelElementRef = useRef<HTMLDivElement | null>(null);
    const animates = useRef(false);
    // The width it had while open, in px, to open back to it: the panel itself
    // opens to its default.
    const lastWidth = useRef<number | null>(null);

    // The panel animates once the layout kept in the browser is in place, so it
    // does not slide from the default size when the editor opens.
    useEffect(() => {
        const timer = setTimeout(() => {
            animates.current = true;
            const element = propertiesPanelElementRef.current;
            if (element) element.style.transition = PROPERTIES_PANEL_TRANSITION;
        }, PROPERTIES_PANEL_READY_MS);
        return () => clearTimeout(timer);
    }, []);

    // While the divider is held the panel follows the pointer, with no
    // transition in the way.
    const setDividerHeld = (held: boolean) => {
        const element = propertiesPanelElementRef.current;
        if (!element || !animates.current) return;
        // Pressing the divider is the last moment the width is the one the
        // user chose, in case the drag folds the panel.
        if (held && element.offsetWidth >= PROPERTIES_PANEL_MIN_SIZE) {
            lastWidth.current = element.offsetWidth;
        }
        element.style.transition = held ? "none" : PROPERTIES_PANEL_TRANSITION;
    };

    const toggle = () => {
        const panel = propertiesPanelRef.current;
        if (!panel) return;
        if (!panel.isCollapsed()) {
            // The width is read now, before it shrinks: the resizes that come
            // while it folds are read halfway through the animation.
            const width = propertiesPanelElementRef.current?.offsetWidth ?? 0;
            if (width >= PROPERTIES_PANEL_MIN_SIZE) lastWidth.current = width;
            return panel.collapse();
        }
        if (lastWidth.current === null) return panel.expand();
        panel.resize(lastWidth.current);
    };

    const onPropertiesResize = (size: PanelSize) => {
        setOpen(size.asPercentage > 0);
    };

    useHotkey(TILE_EDITOR_KEYS.TOGGLE_PROPERTIES, toggle, { enabled });

    return {
        propertiesOpen: open,
        propertiesPanelElementRef,
        setDividerHeld,
        toggleProperties: toggle,
        propertiesPanelRef,
        onPropertiesResize,
    };
};
