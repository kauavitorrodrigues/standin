import { SPACE_THUMBNAIL } from "../consts/thumbnail";

export const buildThumbnailFormData = (thumbnail: Blob): FormData => {
    const body = new FormData();
    body.append(
        SPACE_THUMBNAIL.FIELD,
        new File([thumbnail], SPACE_THUMBNAIL.FILE_NAME, {
            type: SPACE_THUMBNAIL.MIME_TYPE,
        })
    );
    return body;
};
