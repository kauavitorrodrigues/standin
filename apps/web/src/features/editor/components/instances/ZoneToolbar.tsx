import type { RefObject } from "react";
import { ZoneToolbarControls } from "@/features/editor/components/instances/ZoneToolbarControls";

type ZoneToolbarProps = {
    toolbarRef: RefObject<HTMLDivElement | null>;
};

// The bar over the selected zone. Same as the bar of an object: the element
// sits at the corner of the page and the scene moves it by writing its
// transform (see applyToolbarAnchor), so the camera never renders React. It
// starts hidden until the scene reports a place.
export const ZoneToolbar = ({ toolbarRef }: ZoneToolbarProps) => (
    <div
        ref={toolbarRef}
        className="group pointer-events-none fixed top-0 left-0 z-99 invisible"
    >
        <div className="-translate-x-1/2 -translate-y-full group-data-[below=true]:translate-y-0">
            <ZoneToolbarControls />
        </div>
    </div>
);
