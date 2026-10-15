import type { TileMetaEntry } from "../../../types/meta";

type WallFields = Pick<
    TileMetaEntry,
    "edges" | "style" | "overlap" | "solidMask"
>;

// The fields only a wall piece has, as they are on an entry. Nothing is
// listed for the ones the entry does not have.
export const pickWallFields = (entry: TileMetaEntry): WallFields => {
    const fields: WallFields = {};
    if (entry.edges !== undefined) fields.edges = entry.edges;
    if (entry.style !== undefined) fields.style = entry.style;
    if (entry.overlap !== undefined) fields.overlap = entry.overlap;
    if (entry.solidMask !== undefined) fields.solidMask = entry.solidMask;
    return fields;
};

// The entry without the fields of a wall piece.
export const omitWallFields = (entry: TileMetaEntry): TileMetaEntry => {
    const {
        edges: _edges,
        style: _style,
        overlap: _overlap,
        solidMask: _solidMask,
        ...rest
    } = entry;
    return rest;
};
