import type { LayoutIssueCode } from "@standin/contracts";
import type { DOOR_PLACEMENT_REASONS } from "@/features/editor/consts/door-reasons";

// Why a spot is refused: a layout issue or a door rule of the editor.
export type PlacementReason =
    | LayoutIssueCode
    | (typeof DOOR_PLACEMENT_REASONS)[keyof typeof DOOR_PLACEMENT_REASONS];

export type PlacementResult =
    { ok: true } | { ok: false; reason: PlacementReason };
