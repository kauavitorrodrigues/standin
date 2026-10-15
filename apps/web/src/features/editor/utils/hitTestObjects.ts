import type { EditorModel } from "@standin/contracts";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";

type Params = {
    model: Readonly<EditorModel>;
    worldX: number;
    worldY: number;
    surface: ObjectSurface;
};

// The object with the greatest depth under the point. A point counts when it
// is inside the box of the sprite, transparent pixels included, so the whole
// image width answers to the pointer. On equal depth the later object in the
// list wins, as it is drawn later.
export const hitTestObjects = ({
    model,
    worldX,
    worldY,
    surface,
}: Params): SelectionTarget | null => {
    const lookup = createObjectLookup(model);
    let best: SelectionTarget | null = null;

    for (const placed of model.placed) {
        const bounds = getObjectBounds(placed, lookup, surface);
        if (!bounds) continue;

        const insideX = worldX >= bounds.x && worldX < bounds.x + bounds.width;
        const insideY = worldY >= bounds.y && worldY < bounds.y + bounds.height;
        if (!insideX || !insideY) continue;

        if (best && best.depth > bounds.depth) continue;
        best = {
            kind: "object",
            id: placed.id,
            depth: bounds.depth,
            area: bounds.width * bounds.height,
        };
    }

    return best;
};
