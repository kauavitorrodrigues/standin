import { AvatarPartController } from "./parts";
import { AvatarBaseController } from "./bases";
import { AvatarCategoryController } from "./categories";
import { AvatarEditorController } from "./editor";
import { getMyAvatar } from "./me/get";
import { setMyAvatar } from "./me/set";
import { clearMyAvatar } from "./me/clear";

export const AvatarController = {
    parts: AvatarPartController,
    categories: AvatarCategoryController,
    bases: AvatarBaseController,
    editor: AvatarEditorController,
    me: {
        get: getMyAvatar,
        set: setMyAvatar,
        clear: clearMyAvatar,
    },
};
