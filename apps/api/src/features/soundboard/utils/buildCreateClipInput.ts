import { SOUNDBOARD_UPLOAD_FIELDS } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import type { CreateClipInput } from "../types";

/**
 * The file and the form fields of an upload. The fields stay raw: the service
 * validates them, the controller only picks them out of the form.
 */
export const buildCreateClipInput = (req: ExtendedRequest): CreateClipInput => {
    const file = req.file;

    return {
        upload: file && {
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
        },
        fields: {
            name: req.body?.[SOUNDBOARD_UPLOAD_FIELDS.name],
            icon: req.body?.[SOUNDBOARD_UPLOAD_FIELDS.icon],
            volume: req.body?.[SOUNDBOARD_UPLOAD_FIELDS.volume],
        },
    };
};
