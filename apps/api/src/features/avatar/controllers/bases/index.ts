import { listAvatarBases } from "./list";
import { createAvatarBase } from "./create";
import { updateAvatarBase } from "./update";
import { replaceAvatarBaseImage } from "./replaceImage";
import { replaceAvatarBasePreview } from "./replacePreview";
import { removeAvatarBasePreview } from "./removePreview";
import { deleteAvatarBase } from "./delete";

export const AvatarBaseController = {
    list: listAvatarBases,
    create: createAvatarBase,
    update: updateAvatarBase,
    replaceImage: replaceAvatarBaseImage,
    replacePreview: replaceAvatarBasePreview,
    removePreview: removeAvatarBasePreview,
    delete: deleteAvatarBase,
};
