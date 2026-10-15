import type { Zone } from "../../../layout/zone";
import type { ZoneInput } from "../../schemas/editorOp.schema";
import { cellToWorld } from "../cellToWorld";
import { TILE_SIZE } from "../../../consts/constants";

/** Zone in pixels, as the layout stores it, from a zone in tiles. */
export const zoneInputToZone = (input: ZoneInput): Zone => {
    const [x, y] = cellToWorld(input.rect.x, input.rect.y);

    return {
        id: input.id,
        kind: input.kind,
        x,
        y,
        width: input.rect.w * TILE_SIZE,
        height: input.rect.h * TILE_SIZE,
        label: input.label,
        key: input.key,
    };
};
