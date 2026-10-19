import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";

// The routes that swap one image (the sheet of a base or the preview of a
// part, of a category or of a base) take it in the `image` part.
export const buildImageFormData = (image: File): FormData => {
    const body = new FormData();
    body.append(AVATAR_UPLOAD_PARTS.IMAGE, image);
    return body;
};
