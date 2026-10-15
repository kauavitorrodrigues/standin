import { pruneTileMeta, type CreateTilesetData } from "@standin/contracts";
import type { CreateTilesetFormValues } from "../types/createForm";

// The `data` part of `POST /library/tilesets`. The marks only go when there
// is any.
export const buildTilesetData = (
    values: CreateTilesetFormValues,
    tileCount: number
): CreateTilesetData => {
    const tileMeta = pruneTileMeta(values.tileMeta, tileCount);
    return {
        name: values.name.trim(),
        margin: values.margin ?? 0,
        spacing: values.spacing ?? 0,
        ...(Object.keys(tileMeta).length > 0 ? { tileMeta } : {}),
    };
};
