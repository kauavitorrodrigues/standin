import type { ClipFields, SoundboardUpload } from "@standin/core";

// The multipart request of a clip upload, split into what the service takes.
export type CreateClipInput = {
    upload: SoundboardUpload | undefined;
    fields: ClipFields;
};
