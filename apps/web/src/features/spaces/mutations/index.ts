import { useCreate } from "./create";
import { useUpdate } from "./update";
import { useDelete } from "./delete";
import { useSetThumbnail } from "./setThumbnail";

export const SpaceMutations = {
    create: useCreate,
    update: useUpdate,
    delete: useDelete,
    setThumbnail: useSetThumbnail,
};
