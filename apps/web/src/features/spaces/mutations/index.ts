import { useCreate } from "./create";
import { useUpdate } from "./update";
import { useDelete } from "./delete";

export const SpaceMutations = {
    create: useCreate,
    update: useUpdate,
    delete: useDelete,
};
