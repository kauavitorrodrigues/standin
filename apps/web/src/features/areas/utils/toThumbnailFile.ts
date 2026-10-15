import { AREA_THUMBNAIL_FILE_NAME } from "../consts/thumbnail";

// The PNG the camera took, as the file the upload sends.
export const toThumbnailFile = (blob: Blob): File =>
    new File([blob], AREA_THUMBNAIL_FILE_NAME, { type: "image/png" });
