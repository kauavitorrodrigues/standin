import { validateAvatarPreview } from "../../../avatar/utils/validateAvatarPreview";
import { validateAvatarSheet } from "../../../avatar/utils/validateAvatarSheet";

// Holds the images to the rules of the avatar endpoints before anything is
// written, so a bad sheet or preview fails while the entry is still intact.
// An image that is left out is not checked.
export const assertImagesValid = ({
    sheet,
    preview,
}: {
    sheet?: Buffer;
    preview?: Buffer;
}): void => {
    if (sheet) validateAvatarSheet(sheet);
    if (preview) validateAvatarPreview(preview);
};
