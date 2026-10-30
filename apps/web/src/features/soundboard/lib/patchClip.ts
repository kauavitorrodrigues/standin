import type { SoundboardClip } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { UpdateClipInput } from "../types/clip";
import { buildClipsPath } from "../utils/buildPath";

export const patchClip = async (
    organizationId: string,
    { scope, clipId, body }: UpdateClipInput
): Promise<SoundboardClip> => {
    const res = await api.patch(
        `${buildClipsPath(scope, organizationId)}/${clipId}`,
        body
    );
    return res.data.clip;
};
