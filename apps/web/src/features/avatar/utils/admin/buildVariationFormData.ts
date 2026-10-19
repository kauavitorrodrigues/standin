import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";
import type { CreateAvatarVariationData } from "@standin/contracts";

type Params = {
    image: File;
    preview: File;
    data: CreateAvatarVariationData;
};

// A color variation is sent like a part: the sprite PNG, the preview PNG and
// the JSON with the color, both images required.
export const buildVariationFormData = ({
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
