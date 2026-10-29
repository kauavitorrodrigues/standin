import { createContext, useContext } from "react";

// What a tile can do with the video of the person it shows. The stage provides
// it, so the tiles of the strip and of the full view get it without each level
// passing it down. Without a provider a tile offers none of it.
export type StageVideoActions = {
    hideVideo?: (userId: string) => void;
    showVideo?: (userId: string) => void;
};

const NO_ACTIONS: StageVideoActions = {};

export const StageVideoActionsContext =
    createContext<StageVideoActions>(NO_ACTIONS);

export const useStageVideoActions = (): StageVideoActions =>
    useContext(StageVideoActionsContext);
