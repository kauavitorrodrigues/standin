import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TILE_OVERLAY_INSET_CLASS } from "../../../consts/tileOverlay";

type Props = { children: ReactNode };

// The buttons over a tile. They appear on hover and on focus, sit well inside
// the sides of the tile and leave the space between them to the body, which a
// tap can still reach. The layout is fixed, so showing them moves nothing. An
// open menu keeps them in sight, so they do not vanish under the cursor.
export const ClipTileOverlay = ({ children }: Props) => (
    <div
        className={cn(
            "pointer-events-none absolute inset-0 flex h-full items-center justify-between opacity-0 transition-opacity group-has-[:focus-visible]/tile:opacity-100 group-hover/tile:opacity-100 has-[[aria-expanded=true]]:opacity-100",
            TILE_OVERLAY_INSET_CLASS
        )}
    >
        {children}
    </div>
);
