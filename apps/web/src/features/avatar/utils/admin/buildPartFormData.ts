import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";
import type { CreateAvatarPartData } from "@standin/contracts";

type Params = {
    image: File;
    preview: File;
    data: CreateAvatarPartData;
};

// The creation of a part is three parts: the sprite PNG, the preview PNG and
// the JSON with the fields, both images required.
export const buildPartFormData = ({
    image,
    preview,
    data,
}: Params): FormData => {
    const body = new FormData();
    body.append(AVATAR_UPLOAD_PARTS.IMAGE, image);
    body.append(AVATAR_UPLOAD_PARTS.PREVIEW, preview);
    body.append(AVATAR_UPLOAD_PARTS.DATA, JSON.stringify(data));
    return body;
};
