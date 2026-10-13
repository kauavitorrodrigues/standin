import type { spaceSelect } from "../consts/select";

// The row carries the creation date as a Date, the contract as an ISO string.
export type SelectedSpace = {
    [Key in keyof typeof spaceSelect]: (typeof spaceSelect)[Key]["_"]["data"];
};
