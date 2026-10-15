import type { Space } from "@standin/contracts";
import type { SelectedSpace } from "../types/selected-space";

export const serializeSpace = (space: SelectedSpace): Space => ({
    ...space,
    createdAt: space.createdAt.toISOString(),
});
