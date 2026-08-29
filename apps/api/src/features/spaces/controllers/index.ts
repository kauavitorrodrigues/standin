import { createSpace } from "./create";
import { listSpaces } from "./list";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";

export const SpaceController = {
    create: createSpace,
    list: listSpaces,
    update: updateSpace,
    delete: deleteSpace,
};
