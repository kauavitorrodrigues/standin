import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";
import type { CreateAvatarBaseData } from "@standin/contracts";

type Params = {
    image: File;
    preview: File | null;
    data: CreateAvatarBaseData;
};

// The creation of a base is up to three parts: the sprite sheet, the optional
// preview image and the JSON with the fields.
export const buildBaseFormData = ({
    image,
    preview,
    data,
}: Params): FormData => {
    const body = new FormData();
    body.append(AVATAR_UPLOAD_PARTS.IMAGE, image);
    if (preview !== null) body.append(AVATAR_UPLOAD_PARTS.PREVIEW, preview);
    body.append(AVATAR_UPLOAD_PARTS.DATA, JSON.stringify(data));
    return body;
};
