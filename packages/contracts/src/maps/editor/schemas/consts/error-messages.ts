import { AREA_NAME_MAX } from "../../../../areas/consts/limits";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "../../consts/limits";

export const EditorOpErrorMessages = {
    op: { invalid: "The editor operation is invalid." },
    cells: {
        max: "A paint or erase operation can touch at most 2500 cells.",
    },
    tiles: {
        invalid: "The paint tiles list is invalid.",
        empty: "A paint tiles operation needs at least one tile.",
        max: "A paint tiles operation can touch at most 2500 cells in total.",
    },
    zone: {
        invalid: "The zone is invalid.",
        id: { invalid: "The zone id is invalid." },
        kind: { invalid: "The zone kind must be spawn or area." },
        rect: { invalid: "The zone rectangle must be whole tiles." },
        size: {
            min: "An area zone must be at least 2 tiles on each side.",
        },
        label: {
            invalid: "The zone label is invalid.",
            required: "An area zone requires a label.",
        },
    },
    tempId: { invalid: "The temporary object id is invalid." },
    assetId: { invalid: "The asset id is invalid." },
    id: { invalid: "The object id is invalid." },
    tile: { invalid: "The object position must be whole tiles." },
    offset: {
        invalid: "The object offset must be an integer within one tile.",
    },
    parentId: { invalid: "The parent object id is invalid." },
    releaseDesk: { invalid: "The releaseDesk flag is invalid." },
};

export const PublishErrorMessages = {
    publishId: { invalid: "The publish id must be a UUID." },
    baseVersion: {
        invalid: "The base version must be an integer of 1 or more.",
    },
    ops: {
        invalid: "The publish operations are invalid.",
        max: "A publish can carry at most 5000 operations.",
    },
    version: { invalid: "The published version is invalid." },
    idMap: { invalid: "The id map is invalid." },
    limits: { invalid: "The object limits are invalid." },
};

export const StampErrorMessages = {
    invalid: "The area stamp is invalid.",
    version: "The area stamp version is not supported.",
    size: {
        invalid: "The area size must be whole tiles.",
        tooSmall: `The area must be at least ${STAMP_MIN_SIZE} tiles on each side.`,
        tooLarge: `The area cannot exceed ${STAMP_MAX_WIDTH} x ${STAMP_MAX_HEIGHT} tiles.`,
    },
    palette: {
        invalid: "The area tile palette is invalid.",
        duplicated: "The area tile palette repeats a tile.",
    },
    tilesetId: { invalid: "The tileset id is invalid." },
    tileIndex: { invalid: "The tile index is invalid." },
    layers: {
        invalid: "The area layers are invalid.",
        length: "A layer must have width times height cells.",
        outOfRange: "A layer uses a tile that is not in the palette.",
    },
    object: {
        invalid: "An area object is invalid.",
        max: `The area cannot hold more than ${STAMP_MAX_OBJECTS} objects.`,
    },
    assetId: { invalid: "The asset id is invalid." },
    position: {
        invalid: "The object position must be whole tiles inside the area.",
    },
    offset: {
        invalid: "The object offset must be an integer within one tile.",
    },
    parentIndex: {
        invalid: "The parent object index is invalid.",
        order: "A parent object must come before its children.",
    },
    zone: {
        invalid: `The area zone label must have 1 to ${AREA_NAME_MAX} characters.`,
    },
};
