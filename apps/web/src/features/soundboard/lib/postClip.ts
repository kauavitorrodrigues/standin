import type { SoundboardClip } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { UploadClipInput } from "../types/upload";
import { buildClipFormData } from "../utils/buildClipFormData";
import { buildClipsPath } from "../utils/buildPath";

export const postClip = async (
    organizationId: string,
    { scope, bytes, onProgress, ...fields }: UploadClipInput
): Promise<SoundboardClip> => {
    const res = await api.post(
        buildClipsPath(scope, organizationId),
        buildClipFormData(bytes, fields),
        {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
                if (!event.total) return;
                onProgress?.(Math.round((event.loaded / event.total) * 100));
            },
        }
    );
    return res.data.clip;
};
