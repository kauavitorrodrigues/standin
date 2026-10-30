import { api } from "@/lib/axios/api";
import type { ClipRef } from "../types/clip";
import { buildClipsPath } from "../utils/buildPath";

export const removeClip = async (
    organizationId: string,
    { scope, clipId }: ClipRef
): Promise<void> => {
    await api.delete(`${buildClipsPath(scope, organizationId)}/${clipId}`);
};
