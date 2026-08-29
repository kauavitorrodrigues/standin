import { createSpace } from "./create";
import { listSpaces } from "./list";
import { getSpaceDetails } from "./details";
import { updateSpace } from "./update";
import { deleteSpace } from "./delete";

export const SpaceController = {
    create: createSpace,
    list: listSpaces,
    details: getSpaceDetails,
    update: updateSpace,
    delete: deleteSpace,
};
