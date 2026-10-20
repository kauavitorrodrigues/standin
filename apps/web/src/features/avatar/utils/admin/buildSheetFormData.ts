import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";

// Swapping the sheet sends only the sprite PNG.
export const buildSheetFormData = (image: File): FormData => {
    const body = new FormData();
    body.append(AVATAR_UPLOAD_PARTS.IMAGE, image);
    return body;
};
