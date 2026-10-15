export const EditorOpErrorMessages = {
    op: { invalid: "The editor operation is invalid." },
    cells: {
        max: "A paint or erase operation can touch at most 2500 cells.",
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
