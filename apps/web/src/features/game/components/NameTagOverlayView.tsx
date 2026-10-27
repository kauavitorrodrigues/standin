import { createPortal } from "react-dom";
import {
    NameTagPill,
    type NameTagPillProps,
} from "@/features/game/components/NameTagPill";

export type NameTagOverlayItem = {
    id: number;
    // The wrapper the overlay places over the avatar. The pill is drawn in it.
    node: HTMLElement;
    props: NameTagPillProps;
};

type NameTagOverlayViewProps = {
    items: NameTagOverlayItem[];
};

// Every name tag of the scene, drawn by one React root. Each pill goes into the
// wrapper of its tag through a portal, so the overlay moves the wrappers
// without React and React only draws what is inside them.
export const NameTagOverlayView = ({ items }: NameTagOverlayViewProps) => (
    <>
        {items.map(({ id, node, props }) =>
            createPortal(<NameTagPill {...props} />, node, String(id))
        )}
    </>
);
