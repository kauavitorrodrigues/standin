import { useCreate } from "./create";
import { useUpdate } from "./update";
import { useDelete } from "./delete";

export const SoundboardMutations = {
    create: useCreate,
    update: useUpdate,
    delete: useDelete,
};
