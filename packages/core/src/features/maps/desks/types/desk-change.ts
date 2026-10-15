export type DeskChange = {
    spaceId: string;
    mapAssetId: string;
    userId: string;
};

// A claim or an assignment may free the desk the person had before.
export type DeskSwap = DeskChange & {
    releasedMapAssetId: string | null;
};
