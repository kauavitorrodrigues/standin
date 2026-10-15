import { useCreate } from "./create";
import { useDelete } from "./delete";
import { useSetThumbnail } from "./setThumbnail";
import { useUpdate } from "./update";

export const TemplateMutations = {
    create: useCreate,
    delete: useDelete,
    setThumbnail: useSetThumbnail,
    update: useUpdate,
};
