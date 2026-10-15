import type { MapRenderPayload } from "@standin/contracts";
import { api } from "@/lib/axios/api";

// The objects revision of the map now, read straight from the server so the
// cache the decorator draws from is not touched. It gives null when the read
// fails, and when the map has no object.
export const getPublishedObjectsRevision = async (
    mapId: string
): Promise<string | null> => {
    try {
        const res = await api.get<MapRenderPayload>(`/maps/${mapId}/render`);
        return res.data.objectsRevision;
    } catch {
        return null;
    }
};
