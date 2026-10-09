import type { Space } from "@standin/contracts";
import type { spaceSelect } from "../consts/select";

type SelectedSpace = {
    [Key in keyof typeof spaceSelect]: (typeof spaceSelect)[Key]["_"]["data"];
};

// The row carries the creation date as a Date, the contract as an ISO string.
export const serializeSpace = (space: SelectedSpace): Space => ({
    ...space,
    createdAt: space.createdAt.toISOString(),
});
