import { callApi } from "../../../api/callApi";
import { THUMBNAIL_TIMEOUT_MS } from "../../../consts/api";
import { PNG_CONTENT_TYPE } from "../../../consts/png";
import type {
    ApiForm,
    HttpTransport,
    PngFile,
    RemoteTarget,
} from "../../../types";
import { TEMPLATE_PATHS, THUMBNAIL_FILE_NAME, THUMBNAIL_PART } from "../consts";

// PUT /templates/:id/thumbnail, a multipart body with the one part.
export const uploadThumbnail = async (
    http: HttpTransport,
    target: RemoteTarget,
    templateId: string,
    thumbnail: PngFile
): Promise<void> => {
    const form: ApiForm = {
        fields: {},
        files: [
            {
                name: THUMBNAIL_PART,
                fileName: THUMBNAIL_FILE_NAME,
                type: PNG_CONTENT_TYPE,
                bytes: thumbnail.bytes,
            },
        ],
    };
    await callApi<object>(http, target, {
        method: "PUT",
        path: TEMPLATE_PATHS.thumbnail(templateId),
        form,
        timeoutMs: THUMBNAIL_TIMEOUT_MS,
    });
};
