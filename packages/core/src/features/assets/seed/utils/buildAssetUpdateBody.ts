import type { AssetCategory } from "@standin/contracts";
import type { UpdateBody } from "../../utils/planAssetUpdate";
import type { SeedAsset } from "../types";
import { stripUndefined } from "./stripUndefined";

// Only the fields the entry states are compared, so a seed that leaves one out
// does not undo an edit made through the API.
export const buildAssetUpdateBody = (
    entry: SeedAsset,
    category: AssetCategory
): UpdateBody =>
    stripUndefined<UpdateBody>({
        name: entry.name,
        category,
        placement: entry.placement,
        solid: entry.solid,
        surfaceHeightPx: entry.surfaceHeightPx,
        footprint: entry.footprint,
        action: entry.action,
        actionParams: entry.actionParams,
        promptText: entry.promptText,
        rotation: entry.rotation,
        color: entry.color,
        animation: entry.animation
            ? {
                  frameDurationMs: entry.animation.frameDurationMs,
                  repeat: entry.animation.repeat,
                  frameCount: entry.animation.frameCount,
              }
            : undefined,
    });
