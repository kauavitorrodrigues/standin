// What the interface needs to know about the draft, without the draft itself.
export type DraftSummary = {
    hasChanges: boolean;
    canUndo: boolean;
    canRedo: boolean;
};
