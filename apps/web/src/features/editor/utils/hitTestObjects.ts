import type { EditorModel } from "@standin/contracts";
import { OBJECT_HIT } from "@/features/editor/consts/object-hit";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";
import { getSliceDepthAt } from "@/features/editor/utils/getSliceDepthAt";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";

type Params = {
    model: Readonly<EditorModel>;
    worldX: number;
    worldY: number;
    surface: ObjectSurface;
};

type Candidate = {
    target: SelectionTarget;
    // Where it is drawn at the point, to tell which one is on top.
    drawnDepth: number;
};

const isBetter = (candidate: Candidate, best: Candidate | null): boolean =>
    !best || candidate.drawnDepth >= best.drawnDepth;

// The object under the point. An object answers in two ways: on a pixel it
// draws, or, failing that, anywhere in the box of its sprite. A pixel always
// beats a box, so a chair that stands in the empty corner of a desk is picked
// and not the desk around it, while a lone object still answers on its
// transparent border. Among the same kind of answer the one drawn on top wins,
// by the depth of the strip of the sprite under the point, and on equal depth
// the later object in the list, as it is drawn later.
export const hitTestObjects = ({
    model,
    worldX,
    worldY,
    surface,
}: Params): SelectionTarget | null => {
    const lookup = createObjectLookup(model);
    let onPixel: Candidate | null = null;
    let inBox: Candidate | null = null;

    for (const placed of model.placed) {
        const bounds = getObjectBounds(placed, lookup, surface);
        if (!bounds) continue;

        const insideX = worldX >= bounds.x && worldX < bounds.x + bounds.width;
        const insideY = worldY >= bounds.y && worldY < bounds.y + bounds.height;
        if (!insideX || !insideY) continue;

        const spriteX = Math.floor(worldX - bounds.x);
        const spriteY = Math.floor(worldY - bounds.y);
        const candidate: Candidate = {
            target: {
                kind: "object",
                id: placed.id,
                depth: bounds.depth,
                area: bounds.width * bounds.height,
            },
            drawnDepth: getSliceDepthAt(bounds.slices, spriteY, bounds.depth),
        };

        const alpha = surface.getAlpha(placed.assetId, spriteX, spriteY);
        if (alpha !== null && alpha >= OBJECT_HIT.MIN_ALPHA) {
            if (isBetter(candidate, onPixel)) onPixel = candidate;
            continue;
        }
        if (isBetter(candidate, inBox)) inBox = candidate;
    }

    return (onPixel ?? inBox)?.target ?? null;
};
