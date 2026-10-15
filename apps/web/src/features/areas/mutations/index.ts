import { useCreate } from "./create";
import { useRemove } from "./remove";
import { useRename } from "./rename";
import { useReplace } from "./replace";

export const AreasMutations = {
    create: useCreate,
    replace: useReplace,
    rename: useRename,
    remove: useRemove,
};
