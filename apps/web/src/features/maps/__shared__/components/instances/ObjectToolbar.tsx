import type { RefObject } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OBJECT_TOOLBAR_TOOLTIP_DELAY_MS } from "@/features/maps/__shared__/consts/object-toolbar";
import { ObjectToolbarControls } from "@/features/maps/__shared__/components/instances/ObjectToolbarControls";

type ObjectToolbarProps = {
    toolbarRef: RefObject<HTMLDivElement | null>;
};

// The bar over the selected object. The element sits at the corner of the page
// and the scene moves it by writing its transform (see applyToolbarAnchor),
// so zoom, camera drags and moving the object never render React. It starts
// hidden until the scene reports a place.
export const ObjectToolbar = ({ toolbarRef }: ObjectToolbarProps) => (
    <div
        ref={toolbarRef}
        className="group pointer-events-none fixed top-0 left-0 z-99 invisible"
    >
        <div className="-translate-x-1/2 -translate-y-full group-data-[below=true]:translate-y-0">
            <TooltipProvider delay={OBJECT_TOOLBAR_TOOLTIP_DELAY_MS}>
                <ObjectToolbarControls />
            </TooltipProvider>
        </div>
    </div>
);
