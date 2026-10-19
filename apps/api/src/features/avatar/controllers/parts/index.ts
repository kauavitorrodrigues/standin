import { createAvatarPart } from "./create";
import { createAvatarPartVariation } from "./createVariation";
import { listAvatarParts } from "./list";
import { updateAvatarPart } from "./update";
import { replaceAvatarPartImage } from "./replaceImage";
import { replaceAvatarPartPreview } from "./previewReplace";
import { deleteAvatarPart } from "./delete";

export const AvatarPartController = {
    create: createAvatarPart,
    createVariation: createAvatarPartVariation,
    list: listAvatarParts,
    update: updateAvatarPart,
    replaceImage: replaceAvatarPartImage,
    replacePreview: replaceAvatarPartPreview,
    delete: deleteAvatarPart,
};
