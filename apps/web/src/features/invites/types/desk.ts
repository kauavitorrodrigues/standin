// A desk kept for the invited people: where it is and which one.
export type DeskChoice = { spaceId: string; mapAssetId: string } | null;

// What goes to the server about the desk: both, or none.
export type DeskInput = {
    spaceId: string | null;
    mapAssetId: string | null;
};
