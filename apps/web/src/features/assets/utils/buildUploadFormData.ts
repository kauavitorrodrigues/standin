import { UPLOAD_FIELDS } from "../consts/uploadFile";

// A library upload is two parts: the PNG and the JSON of its fields.
export const buildUploadFormData = (
    image: File,
    data: object | null
): FormData => {
    const body = new FormData();
    body.append(UPLOAD_FIELDS.IMAGE, image);
    if (data !== null) body.append(UPLOAD_FIELDS.DATA, JSON.stringify(data));
    return body;
};
