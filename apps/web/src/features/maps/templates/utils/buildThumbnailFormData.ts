import { TEMPLATE_THUMBNAIL } from "../consts/thumbnail";

export const buildThumbnailFormData = (thumbnail: Blob): FormData => {
    const body = new FormData();
    body.append(
        TEMPLATE_THUMBNAIL.FIELD,
        new File([thumbnail], TEMPLATE_THUMBNAIL.FILE_NAME, {
            type: TEMPLATE_THUMBNAIL.MIME_TYPE,
        })
    );
    return body;
};
