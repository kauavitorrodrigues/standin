import type { SoundboardClip } from "@standin/contracts";
import type { ComponentType } from "react";

export type TileSlotProps = { clip: SoundboardClip };

// What a screen puts in the actions slot of each tile, besides the overlay.
// Both screens leave it empty now: the manager's actions are in its overlay.
export type TileActionsComponent = ComponentType<TileSlotProps>;

// What a screen puts over each tile for the person to act on its clip: listen
// and play into the call in the panel, listen and open the actions menu in
// the manager.
export type TileOverlayComponent = ComponentType<TileSlotProps>;
