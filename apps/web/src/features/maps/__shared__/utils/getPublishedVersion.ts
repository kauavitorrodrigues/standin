import type { MapRenderPayload } from "@standin/contracts";
import { api } from "@/lib/axios/api";

// The version published now, read straight from the server so the cache the
// editor draws from is not touched. It gives null when the read fails.
export const getPublishedVersion = async (
    mapId: string
): Promise<number | null> => {
    try {
        const res = await api.get<MapRenderPayload>(`/maps/${mapId}/render`);
        return res.data.map.layoutVersion;
    } catch {
        return null;
    }
};
