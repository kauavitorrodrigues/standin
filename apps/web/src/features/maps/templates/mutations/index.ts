import { useCreate } from "./create";
import { useDelete } from "./delete";
import { usePublish } from "./publish";
import { useRetire } from "./retire";
import { useSetThumbnail } from "./setThumbnail";
import { useUpdate } from "./update";

export const TemplateMutations = {
    create: useCreate,
    delete: useDelete,
    publish: usePublish,
    retire: useRetire,
    setThumbnail: useSetThumbnail,
    update: useUpdate,
};
