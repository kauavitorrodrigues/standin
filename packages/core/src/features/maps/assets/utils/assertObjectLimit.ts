import {
    MAX_OBJECTS_PER_MAP,
    MapAssetLimitExceededError,
} from "@standin/contracts";

export const assertObjectLimit = (currentCount: number, adding: number) => {
    if (currentCount + adding > MAX_OBJECTS_PER_MAP) {
        throw new MapAssetLimitExceededError();
    }
};
