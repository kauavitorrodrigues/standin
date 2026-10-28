import { createSpace } from "./create";
import { listSpaces } from "./list";
import { getSpaceDetails } from "./details";
import { updateSpace } from "./update";
import { setSpaceThumbnail } from "./setThumbnail";
import { deleteSpace } from "./delete";

export const SpaceController = {
    create: createSpace,
    list: listSpaces,
    details: getSpaceDetails,
    update: updateSpace,
    setThumbnail: setSpaceThumbnail,
    delete: deleteSpace,
};
